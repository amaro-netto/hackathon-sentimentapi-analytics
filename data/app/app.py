import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os

# --- Configuração ---
app = FastAPI()

# --- CONTRATO DE DADOS (CRÍTICO) ---
# A equipe Java definiu o DTO com o campo "texto".
# Por isso, mudamos de "text" para "texto" aqui para casar com eles.
class SentimentRequest(BaseModel):
    texto: str  

# --- Carregamento do Modelo ---
MODEL_PATH = "project.joblib"
model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("✅ Modelo carregado com sucesso!")
    else:
        print(f"⚠️ Aviso: '{MODEL_PATH}' não encontrado. API rodando em modo DUMMY (Simulação).")

# --- Rotas ---
@app.get("/")
def health_check():
    return {"status": "online", "model_loaded": model is not None}

@app.post("/predict")
def predict(request: SentimentRequest):
    if model:
        try:
            # 1. Faz a previsão (Positivo/Negativo/Neutro)
            prediction = model.predict([request.texto])[0]
            
            # 2. CALCULA A CERTEZA REAL (Isso muda o 0.99 fixo)
            # O modelo retorna algo como [0.10, 0.85, 0.05] (probabilidade de cada classe)
            # Nós pegamos o maior número (0.85)
            probs = model.predict_proba([request.texto])[0]
            proba = float(max(probs))
            
            return {"previsao": str(prediction), "probabilidade": proba}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # Modo Dummy (Só se o arquivo sumir)
        return {
            "previsao": "Positivo (Simulado)", 
            "probabilidade": 0.0,
            "debug": "Sem modelo carregado"
        }

# --- Inicialização ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

'''

import joblib
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import numpy as np

# 1. Variável global para armazenar o modelo
ml_models = {}


# 2. Definir o ciclo de vida (Lifespan)
# Isso garante que o modelo seja carregado apenas UMA vez ao iniciar o servidor.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Lógica de Carregamento (Startup) ---
    try:
        print("Carregando modelo...")
        # Substitua 'model.joblib' pelo caminho do seu arquivo
        ml_models["model"] = joblib.load("./project.joblib")
        print("Modelo carregado com sucesso!")
    except FileNotFoundError:
        print("Erro: Arquivo do modelo não encontrado.")
        ml_models["model"] = None

    yield  # O app roda aqui

    # --- Lógica de Limpeza (Shutdown) ---
    ml_models.clear()
    print("Recursos liberados.")


# 3. Inicializar o App com o lifespan
app = FastAPI(title="API de Predição ML", lifespan=lifespan)

# 4. Definir o Schema de Entrada (Validação de Dados)
# Ajuste os campos conforme as features que seu modelo espera.
class InputData(BaseModel):
    feature_1: float
    feature_2: float
    feature_3: float
    # Exemplo: se for classificação de crédito, poderia ser idade, renda, etc.


# 5. Definir o Endpoint de Predição
@app.post("/predict")
async def predict(data: InputData):
    if ml_models["model"] is None:
        raise HTTPException(status_code=500, detail="Modelo não carregado.")

    try:
        # Converter dados de entrada para o formato que o modelo espera (ex: lista ou array numpy)
        features = [[data.feature_1, data.feature_2, data.feature_3]]

        # Fazer a predição
        prediction = ml_models["model"].predict(features)

        # Opcional: Probabilidade (se for classificação)
        # probability = ml_models["model"].predict_proba(features).tolist()

        return {
            "prediction": int(prediction[0]),
            # "probability": probability
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Endpoint de verificação de saúde (Health Check)
@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": ml_models["model"] is not None}

# --- Inicialização ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
'''