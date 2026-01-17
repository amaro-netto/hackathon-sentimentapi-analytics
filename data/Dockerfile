FROM python:3.11-slim

WORKDIR /app

# Instala dependências
COPY requirements_app.txt .
RUN pip install --no-cache-dir -r requirements_app.txt

# Copia o código da IA
COPY . .

# Expõe a porta 5000
EXPOSE 5000

# Comando para rodar (ajuste 'app.py' se seu arquivo tiver outro nome)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]