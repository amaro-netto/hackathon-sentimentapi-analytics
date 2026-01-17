from datetime import datetime
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
from contextlib import asynccontextmanager

# --- Configuração de Caminhos ---
# No Docker, o arquivo app.py e a pasta models estarão no mesmo nível (/app)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# CORREÇÃO: Removemos o ".." pois agora estarão lado a lado
MODEL_PATH_MULTI = os.path.join(CURRENT_DIR, "models", "modelo_multi.joblib")
model_multi = None
model_loaded_at = None

class SentimentRequest(BaseModel):
    texto: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_multi, model_loaded_at
    if os.path.exists(MODEL_PATH_MULTI):
        try:
            model_multi = joblib.load(MODEL_PATH_MULTI)
            model_loaded_at = datetime.now()
            print(f"✅ Modelo carregado de: {MODEL_PATH_MULTI}\n em {model_loaded_at}")
        except Exception as e:
            print(f"❌ Erro ao carregar Modelo: {e}")
    else:
        print(f"⚠️ ARQUIVO NÃO ENCONTRADO: {MODEL_PATH_MULTI}")
        print(f"Diretório atual: {os.getcwd()}")
        print(f"Conteúdo da pasta: {os.listdir(CURRENT_DIR)}")

    yield
    print("🛑 Desligando API e limpando recursos...")
    model_multi = None

# A variável precisa se chamar 'app' para o Docker achar
app = FastAPI(title="API de Predição ML", lifespan=lifespan)

@app.get("/health")
def healthcheck():
    metrics = getattr(model_multi, "model_metrics", None) if model_multi is not None else None

    return {
        "status": "online",
        "model_loaded": model_multi is not None,
        "model_loaded_at": model_loaded_at,
        "metrics": metrics,
    }
@app.post("/predict")
def predict(request: SentimentRequest):

    if model_multi:
        try:
            pred = model_multi.predict([request.texto])[0]
            sent_pred = pred[0]
            lang_pred = pred[1]

            try:
                probs_list = model_multi.predict_proba([request.texto])
                probs_sent = probs_list[0][0]
                probs_lang = probs_list[1][0]

                moc = model_multi.named_steps['multioutputclassifier']
                classes_sent = moc.estimators_[0].classes_
                classes_lang = moc.estimators_[1].classes_

                idx_sent = list(classes_sent).index(sent_pred)
                idx_lang = list(classes_lang).index(lang_pred)

                proba_sent = float(probs_sent[idx_sent])
                proba_lang = float(probs_lang[idx_lang])
            except AttributeError:
                proba_sent = 1.0
                proba_lang = 1.0

            return {
                "sentimento": str(sent_pred),
                "prob_sentimento": f"{proba_sent * 100:.2f}%",
                "idioma": str(lang_pred),
                "prob_idioma": f"{proba_lang * 100:.2f}%"
                }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # Caso caia aqui e o model_multi não esteja carregado
        return {"erro": "Modelo Multi não carregado no servidor"}

if __name__ == "__main__":
    # Ajustado para rodar o app localmente se precisar
    uvicorn.run(app, host="0.0.0.0", port=8000)