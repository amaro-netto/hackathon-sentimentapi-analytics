# 1. Imagem Base
# Mantemos a 3.11 pois testamos e todas as libs (numpy, scikit) funcionaram nela.
# A 3.13 é muito nova e pode dar dor de cabeça com compatibilidade agora.
FROM python:3.11-slim

WORKDIR /app

# 2. Instalação de Dependências do Sistema (Sugestão do colega)
# Isso é ÓTIMO para evitar erros ao instalar bibliotecas pesadas de IA
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 3. Dependências Python
# Copia apenas o requirements primeiro para aproveitar o cache do Docker
COPY requirements_app.txt .
RUN pip install --no-cache-dir -r requirements_app.txt

# 4. Cópia Seletiva dos Arquivos (Ajuste Solicitado)
# Em vez de COPY . . (que copia tudo), copiamos um por um

# Copia o código da API
COPY app.py .

# Copia a pasta de modelos (O docker cria a pasta 'models' automaticamente no destino)
COPY models/ ./models/

# 5. Execução
EXPOSE 5000

# Mantemos o comando uvicorn explícito (é mais seguro que 'python app.py')
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]