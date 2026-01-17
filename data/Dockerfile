# 1. Imagem Base
# Mantemos a 3.11 pois testamos e todas as libs (numpy, scikit) funcionaram nela.
# A 3.13 é muito nova e pode dar dor de cabeça com compatibilidade agora.
FROM python:3.11-slim

WORKDIR /app

# Instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da IA
COPY . .

# Copia a pasta de modelos (O docker cria a pasta 'models' automaticamente no destino)
COPY models/ ./models/

# 5. Execução
EXPOSE 5000

# Mantemos o comando uvicorn explícito (é mais seguro que 'python app.py')
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]