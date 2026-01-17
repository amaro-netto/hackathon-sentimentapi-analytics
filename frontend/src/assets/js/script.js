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

// Elementos de Idioma
const languageLabel = document.getElementById("languageLabel");
const languageProb = document.getElementById("languageProb");
const langConfidenceBar = document.getElementById("langConfidenceBar");
const analysisDate = document.getElementById("analysisDate");

// Elementos Globais
const historyList = document.getElementById("historyList");
const loading = document.getElementById("loading");

// Configuração da API (Padrão Unificado)
const API_URL = "http://localhost:8080/api/sentiments"; 

// ===============================
// 2. FUNÇÕES UTILITÁRIAS
// ===============================

// Garante que temos o token para falar com o Java
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/"; 
        throw new Error("Sessão expirada");
    }
    return { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
    };
}

function showLoading() {
    if(loading) loading.style.display = "block";
    if(resultContainer) resultContainer.style.opacity = "0.5"; 
}

function hideLoading() {
    if(loading) loading.style.display = "none";
    if(resultContainer) resultContainer.style.opacity = "1"; 
}

function capitalize(text) {
    if (!text) return "--";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function fixPercentage(val) {
    if (!val) return 0;
    // Limpa string "98.5%" para número 98.5
    let num = parseFloat(String(val).replace("%", ""));
    // Se vier 0.98, transforma em 98
    if (num <= 1 && num > 0) return Math.round(num * 100);
    // Trava teto em 100
    if (num > 100) return 100;
    return Math.round(num);
}

// ===============================
// 3. LÓGICA DE INTERAÇÃO
// ===============================

if (reviewInput) {
    reviewInput.addEventListener("input", () => {
        if(charCount) charCount.textContent = reviewInput.value.length + " caracteres";
    });

    reviewInput.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            classifyBtn.click();
        }
    });
}

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
        
        if (response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/";
            return;
        }

        if (!response.ok) throw new Error("Erro ao consultar API");

        const data = await response.json();

        // --- CORREÇÃO DE NOMES (Mapping Inteligente) ---
        // O Python retorna: sentimento, prob_sentimento, idioma, prob_idioma
        // O Java DTO pode retornar: sentiment, probability, language, etc.
        // Aqui aceitamos qualquer um dos dois:
        
        const sentimentRaw = data.sentimento || data.sentiment || data.previsao || "Neutro";
        const probRaw = data.prob_sentimento || data.probabilidade || data.probability || 0;
        const langRaw = data.idioma || data.language || "pt";
        const probLangRaw = data.prob_idioma || data.probIdioma || 99;

        const resultData = {
            sentiment: capitalize(sentimentRaw),
            confidence: fixPercentage(probRaw),
            language: langRaw.toUpperCase(),
            langConfidence: fixPercentage(probLangRaw), 
            date: new Date()
        };

        displayResult(resultData);
        addToHistoryVisual(text, resultData);

    } catch (err) {
        console.error(err);
        alert("Ocorreu um erro: " + err.message);
    } finally {
        hideLoading();
    }
}

// ===============================
// 5. EXIBIÇÃO DO RESULTADO
// ===============================
function displayResult(data) {
    if(!resultContainer) return;

    if(sentimentLabel) sentimentLabel.textContent = data.sentiment;
    if(confidenceValue) confidenceValue.textContent = `${data.confidence}%`;
    
    if(languageLabel) languageLabel.textContent = data.language;
    if(languageProb) languageProb.textContent = `${data.langConfidence}%`;
    
    if(analysisDate) {
        analysisDate.textContent = data.date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    }

    // Barra Sentimento
    if(confidenceBar) {
        confidenceBar.style.width = `${data.confidence}%`; 
        confidenceBar.className = "progress-bar-fill"; 
        if(data.sentiment.includes("Positiv")) confidenceBar.classList.add("Positivo");
        else if(data.sentiment.includes("Negativ")) confidenceBar.classList.add("Negativo");
        else confidenceBar.classList.add("Neutro");
    }

    // Barra Idioma
    if(langConfidenceBar) {
        langConfidenceBar.style.width = `${data.langConfidence}%`;
    }

    // Cor do Card Principal
    resultContainer.className = "result-container"; 
    if(data.sentiment.includes("Positiv")) resultContainer.classList.add("Positivo");
    else if(data.sentiment.includes("Negativ")) resultContainer.classList.add("Negativo");
    else resultContainer.classList.add("Neutro");

    resultContainer.style.display = "block";
}

// ===============================
// 6. HISTÓRICO (CARDS LATERAIS)
// ===============================

window.addEventListener("DOMContentLoaded", () => {
    if(localStorage.getItem("token")) {
        // CORREÇÃO: Removemos o "/history" para bater com o Controller novo
        fetch(API_URL, { headers: getAuthHeaders() })
        .then(r => r.ok ? r.json() : [])
        .then(data => {
            if(historyList) historyList.innerHTML = ""; 
            
            // Inverte para mostrar o mais recente primeiro
            const listaInvertida = Array.isArray(data) ? data.slice().reverse() : [];

            listaInvertida.forEach(item => {
                // Mapping para o Histórico também
                const sent = item.sentimento || item.sentiment || item.previsao || "Neutro";
                const prob = item.prob_sentimento || item.probabilidade || item.probability || 0;
                const lang = item.idioma || item.language || "PT";
                const dateRaw = item.dataAnalise || item.createdAt || new Date();

                addToHistoryVisual(item.texto || item.text, {
                    sentiment: capitalize(sent),
                    confidence: fixPercentage(prob),
                    language: lang.toUpperCase(),
                    date: new Date(dateRaw) 
                });
            });
            
            if(listaInvertida.length === 0) showEmptyHistory();
        })
        .catch((e) => {
            console.error("Erro ao carregar histórico:", e);
            showEmptyHistory();
        });
    }
});

function addToHistoryVisual(text, data) {
    if(!historyList) return;

    const emptyState = historyList.querySelector(".empty-state");
    if(emptyState) emptyState.remove();

    const div = document.createElement("div");
    
    let sentimentClass = "Neutro";
    if(data.sentiment.includes("Positiv")) sentimentClass = "Positivo";
    if(data.sentiment.includes("Negativ")) sentimentClass = "Negativo";

    div.className = `history-card-item ${sentimentClass}`;

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

function getColor(type) {
    if(type === "Positivo") return "#2ecc71";
    if(type === "Negativo") return "#e74c3c";
    return "#3498db"; 
}