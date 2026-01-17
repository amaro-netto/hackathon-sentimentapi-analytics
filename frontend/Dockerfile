# Usamos o Nginx Alpine (versão super leve, ~10MB)
FROM nginx:alpine

# Copia seus arquivos HTML/JS/CSS para a pasta pública do Nginx
COPY . /usr/share/nginx/html

# O Nginx roda nativamente na porta 80 dentro do container
EXPOSE 80