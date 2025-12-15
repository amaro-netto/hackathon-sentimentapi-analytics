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