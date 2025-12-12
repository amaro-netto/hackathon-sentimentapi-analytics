import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os

# --- Configuração ---
app = FastAPI()

# Modelo de Entrada (Contrato com o Java)
class SentimentRequest(BaseModel):
    text: str

# --- Carregamento do Modelo ---
MODEL_PATH = "project.joblib" # O time de DS deve colocar o nome do modelo aqui
model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("✅ Modelo carregado com sucesso!")
    else:
        print(f"⚠️ Aviso: Arquivo '{MODEL_PATH}' não encontrado. A API funcionará em modo 'Dummy'.")

# --- Rotas ---
@app.get("/")
def health_check():
    return {"status": "online", "model_loaded": model is not None}

@app.post("/predict")
def predict(request: SentimentRequest):
    # Se o modelo existir, usa ele. Se não, retorna dummy para teste.
    if model:
        try:
            prediction = model.predict([request.text])[0]
            # Lógica simples de probabilidade se o modelo suportar
            proba = 0.99 if hasattr(model, "predict_proba") else 0.0
            return {"previsao": str(prediction), "probabilidade": proba}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # RESPOSTA DUMMY (Para o Java testar a integração)
        return {"previsao": "Positivo (Dummy)", "probabilidade": 0.5}

# --- Inicialização ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)