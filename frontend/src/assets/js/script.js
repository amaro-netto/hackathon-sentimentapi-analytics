// ===============================
// 1. SELEÇÃO DE ELEMENTOS DO DOM
// ===============================
const reviewInput = document.getElementById("reviewInput");
const classifyBtn = document.getElementById("classifyBtn");
const charCount = document.getElementById("charCount");

// Elementos da Área de Resultado (Esquerda)
const resultContainer = document.getElementById("result");
const sentimentLabel = document.getElementById("sentimentLabel");
const confidenceValue = document.getElementById("confidenceValue");
const confidenceBar = document.getElementById("confidenceBar");

// Elementos de Idioma (Novos)
const languageLabel = document.getElementById("languageLabel");
const languageProb = document.getElementById("languageProb");
const langConfidenceBar = document.getElementById("langConfidenceBar"); // A barra azul
const analysisDate = document.getElementById("analysisDate");

// Elementos Globais
const historyList = document.getElementById("historyList");
const loading = document.getElementById("loading");

// Configuração da API (Ajuste a porta se necessário)
const API_URL = "http://localhost:8080/sentiment"; 

// ===============================
// 2. FUNÇÕES UTILITÁRIAS
// ===============================

// Garante que temos o token para falar com o Java
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/"; // Chuta pro login se não tiver token
        throw new Error("Sessão expirada");
    }
    return { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
    };
}

function showLoading() {
    if(loading) loading.style.display = "block";
    // NÃO esconde mais o resultContainer, ele fica lá fixo
    if(resultContainer) resultContainer.style.opacity = "0.5"; // Só deixa clarinho
}

function hideLoading() {
    if(loading) loading.style.display = "none";
    if(resultContainer) resultContainer.style.opacity = "1"; // Volta ao normal
}

// Deixa a primeira letra maiúscula (ex: "positivo" -> "Positivo")
function capitalize(text) {
    if (!text) return "--";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Limpa e padroniza porcentagens vindas do Backend
// Aceita: "98%", 0.98, 98, "98.5"
function fixPercentage(val) {
    if (!val) return 0;
    
    // Se for string, remove o %
    let num = parseFloat(String(val).replace("%", ""));
    
    // Se vier em decimal (0.98), multiplica por 100
    if (num <= 1 && num > 0) return Math.round(num * 100);
    
    // Se vier normal (98), mantém
    // Se vier maluco (> 100), trava em 100
    if (num > 100) return 100;
    
    return Math.round(num);
}

// ===============================
// 3. LÓGICA DE INTERAÇÃO
// ===============================

// Contador de Caracteres
if (reviewInput) {
    reviewInput.addEventListener("input", () => {
        if(charCount) charCount.textContent = reviewInput.value.length + " caracteres";
    });

    // Enviar com CTRL + ENTER
    reviewInput.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            classifyBtn.click();
        }
    });
}

// Botão Analisar
if (classifyBtn) {
    classifyBtn.addEventListener("click", () => {
        const text = reviewInput.value.trim();
        if (!text) {
            alert("Por favor, digite um texto para analisar.");
            return;
        }
        runAnalysis(text);
    });
}

// ===============================
// 4. CHAMADA À API (O CÉREBRO)
// ===============================
async function runAnalysis(text) {
    showLoading();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ texto: text })
        });
        
        // Se o token expirou
        if (response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/";
            return;
        }

        if (!response.ok) throw new Error("Erro ao consultar API");

        const data = await response.json();

        // Prepara os dados limpos para exibir
        const resultData = {
            sentiment: capitalize(data.previsao || "Neutro"),
            // Pega a confiança do sentimento
            confidence: fixPercentage(data.probabilidade),
            // Pega o idioma (se vier null, assume PT)
            language: (data.idioma || "pt").toUpperCase(),
            // Pega a confiança do idioma
            langConfidence: fixPercentage(data.probIdioma || 99), 
            date: new Date()
        };

        // 1. Atualiza a tela da esquerda
        displayResult(resultData);
        
        // 2. Adiciona no histórico da direita
        addToHistoryVisual(text, resultData);

    } catch (err) {
        console.error(err);
        alert("Ocorreu um erro: " + err.message);
    } finally {
        hideLoading();
    }
}

// ===============================
// 5. EXIBIÇÃO DO RESULTADO (PRINCIPAL)
// ===============================
function displayResult(data) {
    if(!resultContainer) return;

    // Preenche os textos
    if(sentimentLabel) sentimentLabel.textContent = data.sentiment;
    if(confidenceValue) confidenceValue.textContent = `${data.confidence}%`;
    
    if(languageLabel) languageLabel.textContent = data.language;
    if(languageProb) languageProb.textContent = `${data.langConfidence}%`;
    
    if(analysisDate) {
        analysisDate.textContent = data.date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    }

    // --- BARRA DE SENTIMENTO ---
    if(confidenceBar) {
        confidenceBar.style.width = `${data.confidence}%`; // Define tamanho
        
        // Define cor
        confidenceBar.className = "progress-bar-fill"; // Limpa classes anteriores
        if(data.sentiment.includes("Positiv")) confidenceBar.classList.add("Positivo");
        else if(data.sentiment.includes("Negativ")) confidenceBar.classList.add("Negativo");
        else confidenceBar.classList.add("Neutro");
    }

    // --- BARRA DE IDIOMA (AQUELE PROBLEMA QUE VOCÊ FALOU) ---
    if(langConfidenceBar) {
        // Agora ela vai encher baseada na certeza do idioma
        langConfidenceBar.style.width = `${data.langConfidence}%`;
        // Ela já tem a classe 'blue' no HTML, então vai ficar azul
    }

    // --- CORES DO CARD ---
    resultContainer.className = "result-container"; // Limpa classes
    if(data.sentiment.includes("Positiv")) resultContainer.classList.add("Positivo");
    else if(data.sentiment.includes("Negativ")) resultContainer.classList.add("Negativo");
    else resultContainer.classList.add("Neutro");

    // Mostra o card
    resultContainer.style.display = "block";
}

// ===============================
// 6. HISTÓRICO (CARDS LATERAIS)
// ===============================

// Carregar histórico salvo no banco ao abrir a página
window.addEventListener("DOMContentLoaded", () => {
    if(localStorage.getItem("token")) {
        fetch(`${API_URL}/history`, { headers: getAuthHeaders() })
        .then(r => r.ok ? r.json() : [])
        .then(data => {
            if(historyList) historyList.innerHTML = ""; // Limpa msg de vazio
            
            // Inverte para mostrar o mais recente primeiro (se o back não ordenar)
            // Se o back já ordenar, pode tirar o .reverse()
            data.forEach(item => {
                addToHistoryVisual(item.texto, {
                    sentiment: capitalize(item.previsao),
                    confidence: fixPercentage(item.probabilidade),
                    language: (item.idioma || "PT").toUpperCase(),
                    langConfidence: 0, // Histórico antigo talvez não tenha isso, sem problemas
                    date: new Date() // Idealmente o back mandaria a data real
                });
            });
            
            if(data.length === 0) showEmptyHistory();
        })
        .catch(() => showEmptyHistory());
    }
});

function addToHistoryVisual(text, data) {
    if(!historyList) return;

    // Remove mensagem de "Vazio" se existir
    const emptyState = historyList.querySelector(".empty-state");
    if(emptyState) emptyState.remove();

    const div = document.createElement("div");
    
    // Define a classe de cor para a borda lateral
    let sentimentClass = "Neutro";
    if(data.sentiment.includes("Positiv")) sentimentClass = "Positivo";
    if(data.sentiment.includes("Negativ")) sentimentClass = "Negativo";

    div.className = `history-card-item ${sentimentClass}`;

    // HTML Interno do Card
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#888; margin-bottom:5px;">
            <span>${data.date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            <strong>${data.language}</strong>
        </div>
        
        <div style="font-size:0.9rem; color:#333; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;" title="${text}">
            ${text}
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge" style="background:${getColor(sentimentClass)}; color:white; padding:2px 8px; border-radius:4px; font-size:0.75rem;">
                ${data.sentiment}
            </span>
            <span style="font-size:0.8rem; color:#666; font-weight:600;">
                ${data.confidence}%
            </span>
        </div>
    `;

    // Adiciona no topo da lista
    historyList.prepend(div);
}

function showEmptyHistory() {
    if(!historyList) return;
    historyList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Nenhuma análise feita nesta sessão.</p>
        </div>
    `;
}

// Auxiliar de cores para o badge do histórico
function getColor(type) {
    if(type === "Positivo") return "#2ecc71";
    if(type === "Negativo") return "#e74c3c";
    return "#3498db"; // Neutro
}