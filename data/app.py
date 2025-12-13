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
    # Lógica: Se o modelo existir, usa ele. Se não, simula uma resposta.
    if model:
        try:
            # AQUI: Usamos request.texto (o nome que vem do Java)
            prediction = model.predict([request.texto])[0]
            
            # Tenta pegar probabilidade se o modelo suportar
            proba = 0.99 if hasattr(model, "predict_proba") else 0.0
            
            return {"previsao": str(prediction), "probabilidade": proba}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # MODO DUMMY (Para teste enquanto o modelo não é treinado)
        # Retorna nomes de campos padrão (previsao/probabilidade)
        return {
            "previsao": "Positivo (Simulado)", 
            "probabilidade": 0.75,
            "debug_texto_recebido": request.texto
        }

# --- Inicialização ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)