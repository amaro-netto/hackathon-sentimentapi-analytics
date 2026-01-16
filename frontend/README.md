# Frontend - Sentiment API

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── script.js
│   └── pages/
│       └── sentiment.html
├── index.html
├── server.py
└── README.md
```

## 🚀 Como Executar

### Opção 1: Usar Python (recomendado)
```bash
cd frontend
python server.py
```
Acesse: `http://localhost:3000`

### Opção 2: Usar Node.js + http-server
```bash
npm install -g http-server
cd frontend
http-server -p 3000 -c-1
```

### Opção 3: Usar Live Server (VS Code)
Instale a extensão Live Server e clique em "Go Live"

## ⚙️ Configurações

- **API Backend**: `http://localhost:8080`
- **Porta do Frontend**: `3000`
- **CORS**: Habilitado no backend

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` (opcional):
```
VITE_API_URL=http://localhost:8080
VITE_PORT=3000
```

## 📦 Arquivos Principais

- `index.html` - Página inicial
- `src/pages/sentiment.html` - Página de análise de sentimentos
- `src/assets/css/style.css` - Estilos da aplicação
- `src/assets/js/script.js` - Lógica JavaScript

## 🔗 Adicionar Novas Páginas

1. Crie um novo arquivo `.html` em `src/pages/`
2. Atualize os caminhos de CSS/JS conforme necessário:
   - CSS: `../assets/css/style.css`
   - JS: `../assets/js/script.js`

## 📱 Responsive Design

A aplicação é totalmente responsiva para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (até 767px)

## 🎨 Customização de Cores

Edite `style.css` para mudar as cores:
- Primária: `#4b6cb7`
- Secundária: `#182848`
- Sucesso: `#2ecc71`
- Erro: `#e74c3c`
