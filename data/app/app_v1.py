import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
from contextlib import asynccontextmanager  # <--- Import necessário

# --- Carregamento dos Modelos e Variaveis Globais ---
MODEL_PATH_PT = "../models/modelo_pt.joblib"
MODEL_PATH_ES = "../models/modelo_es.joblib"
MODEL_PATH_MULTI = "../models/modelo_multi.joblib"
model_pt = None
model_es = None
model_multi = None

# --- CONTRATO DE DADOS ---
class SentimentRequest(BaseModel):
    texto: str
    lang: str

# --- LIFESPAN (Substitui o @app.on_event) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lógica de STARTUP (Roda ao ligar)
    global model_pt, model_es, model_multi

    # Carregar Modelo PT
    if os.path.exists(MODEL_PATH_PT):
        try:
            model_pt = joblib.load(MODEL_PATH_PT)
            print("✅ Modelo PT carregado com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao carregar Modelo PT: {e}")
    else:
        print(f"⚠️ Aviso: '{MODEL_PATH_PT}' não encontrado. API rodando em modo DUMMY.")

    # Carregar Modelo ES
    if os.path.exists(MODEL_PATH_ES):
        try:
            model_es = joblib.load(MODEL_PATH_ES)
            print("✅ Modelo ES carregado com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao carregar Modelo ES: {e}")
    else:
        print(f"⚠️ Aviso: '{MODEL_PATH_ES}' não encontrado.")

        # Carregar Modelo MULTI
    if os.path.exists(MODEL_PATH_MULTI):
        try:
            model_multi = joblib.load(MODEL_PATH_MULTI)
            print("✅ Modelo MULTI carregado com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao carregar Modelo MULTI: {e}")
    else:
        print(f"⚠️ Aviso: '{MODEL_PATH_MULTI}' não encontrado.")

    yield  # A aplicação roda aqui

    # Lógica de SHUTDOWN (Opcional: roda ao desligar)
    print("🛑 Desligando API e limpando recursos...")
    model_pt = None
    model_es = None
    model_multi = None

# --- Configuração ---
# Agora a variável 'lifespan' existe, então essa linha funciona:
app = FastAPI(title="API de Predição ML", lifespan=lifespan)

# --- Rotas ---
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model_pt_loaded": model_pt is not None,
        "model_es_loaded": model_es is not None,
        "model_multi_loaded": model_multi is not None
    }

@app.post("/predict")
def predict(request: SentimentRequest):
    # --- BLOCO PORTUGUÊS ---
    if request.lang == "pt":
        if model_pt:
            try:
                prediction = model_pt.predict([request.texto])[0]
                try:
                    probs = model_pt.predict_proba([request.texto])[0]
                    proba = float(max(probs))
                except AttributeError:
                    proba = 1.0
                return {"idioma": "pt", "previsao": str(prediction), "probabilidade": f"{proba*100:.2f}%"}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        else:
            return {"previsao": "Positivo (Simulado)", "probabilidade": 0.0, "debug": "Sem modelo PT carregado"}

    # --- BLOCO ESPANHOL ---
    elif request.lang == 'es':
        if model_es:
            try:
                prediction = model_es.predict([request.texto])[0]
                try:
                    probs = model_es.predict_proba([request.texto])[0]
                    proba = float(max(probs))
                except AttributeError:
                    proba = 1.0
                return {"idioma": "es", "previsao": str(prediction), "probabilidade": f"{proba * 100:.2f}%"}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        else:
             return {"previsao": "Positivo (Simulado)", "probabilidade": 0.0, "debug": "Sem modelo ES carregado"}

    # --- BLOCO AUTO-DETECT (MULTI) ---
    # CORREÇÃO: Este elif foi trazido para fora, alinhado com o 'if' principal
    elif request.lang == '':
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

    # --- CASO NENHUM IDIOMA CORRESPONDA ---
    return {"erro": "Idioma não suportado ou inválido"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000)