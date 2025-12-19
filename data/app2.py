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
        ml_models["model"] = joblib.load("model.joblib")
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