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

class SentimentRequest(BaseModel):
    texto: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_multi
    if os.path.exists(MODEL_PATH_MULTI):
        try:
            model_multi = joblib.load(MODEL_PATH_MULTI)
            print(f"✅ Modelo carregado de: {MODEL_PATH_MULTI}")
        except Exception as e:
            print(f"❌ Erro ao carregar Modelo: {e}")
    else:
        print(f"⚠️ ARQUIVO NÃO ENCONTRADO: {MODEL_PATH_MULTI}")
        print(f"Diretório atual: {os.getcwd()}")
        print(f"Conteúdo da pasta: {os.listdir(CURRENT_DIR)}")

    yield
    model_multi = None

# A variável precisa se chamar 'app' para o Docker achar
app = FastAPI(title="API de Predição ML", lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "online", "model_loaded": model_multi is not None}

@app.post("/predict")
def predict(request: SentimentRequest):
    if model_multi:
        try:
            pred = model_multi.predict([request.texto])[0]
            # Lógica de predição mantida...
            sent_pred = pred[0]
            lang_pred = pred[1]

            try:
                probs = model_multi.predict_proba([request.texto])
                # Simplificação para evitar erros de índice se o modelo mudar
                proba_sent = float(max(probs[0][0])) 
                proba_lang = float(max(probs[1][0]))
            except:
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
    return {"erro": "Modelo não carregado"}

if __name__ == "__main__":
    # Ajustado para rodar o app localmente se precisar
    uvicorn.run(app, host="0.0.0.0", port=8000)