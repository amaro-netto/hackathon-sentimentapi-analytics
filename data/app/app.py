import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
from contextlib import asynccontextmanager  # <--- Import necessário

# --- Carregamento dos Modelos e Variaveis Globais ---
MODEL_PATH_PT = "../models/modelo_pt.joblib"
MODEL_PATH_ES = "../models/modelo_es.joblib"
model_pt = None
model_es = None


# --- CONTRATO DE DADOS ---
class SentimentRequest(BaseModel):
    texto: str

# --- LIFESPAN (Substitui o @app.on_event) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lógica de STARTUP (Roda ao ligar)
    global model_pt, model_es

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

    yield  # A aplicação roda aqui

    # Lógica de SHUTDOWN (Opcional: roda ao desligar)
    print("🛑 Desligando API e limpando recursos...")
    model_pt = None
    model_es = None

# --- Configuração ---
# Agora a variável 'lifespan' existe, então essa linha funciona:
app = FastAPI(title="API de Predição ML", lifespan=lifespan)

# --- Rotas ---
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model_pt_loaded": model_pt is not None,
        "model_es_loaded": model_es is not None
    }


@app.post("/predict")
def predict(request: SentimentRequest):
    if model_pt:
        try:
            # 1. Faz a previsão
            prediction = model_pt.predict([request.texto])[0]

            # 2. Calcula probabilidade (Se o modelo suportar predict_proba)
            try:
                probs = model_pt.predict_proba([request.texto])[0]
                proba = float(max(probs))
            except AttributeError:
                # Caso o modelo não suporte predict_proba (ex: alguns SVMs)
                proba = 1.0

            return {"previsao": str(prediction), "probabilidade": f"{proba*100:.2f}%"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # Modo Dummy
        return {
            "previsao": "Positivo (Simulado)",
            "probabilidade": 0.0,
            "debug": "Sem modelo carregado"
        }


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)