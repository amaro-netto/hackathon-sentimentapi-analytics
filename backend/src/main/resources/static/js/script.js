// ===============================
// Elementos DOM
// ===============================
const reviewInput = document.getElementById("reviewInput");
const classifyBtn = document.getElementById("classifyBtn");
const charCount = document.getElementById("charCount");

const result = document.getElementById("result");
const sentimentLabel = document.getElementById("sentimentLabel");
const confidenceValue = document.getElementById("confidenceValue");
const confidenceBar = document.getElementById("confidenceBar");
const keywords = document.getElementById("keywords");
const analysisDate = document.getElementById("analysisDate");

const historyList = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");
const loading = document.getElementById("loading");

// ===============================
// Configurações
// ===============================
const HISTORY_LIMIT = 10;
const API_URL = "http://localhost:8080/sentiment";

// ===============================
// Utilidades
// ===============================
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "login.html";
        throw new Error("Token não encontrado");
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

function showLoading() {
    if(loading) loading.classList.add("show");
    if(result) result.classList.remove("show");
}

function hideLoading() {
    if(loading) loading.classList.remove("show");
}

function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ===============================
// Eventos
// ===============================
if (reviewInput) {
    reviewInput.addEventListener("input", () => {
        charCount.textContent = reviewInput.value.length;
    });
    reviewInput.addEventListener("keydown", e => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            classifyBtn.click();
        }
    });
}

if (classifyBtn) {
    classifyBtn.addEventListener("click", () => {
        const reviewText = reviewInput.value.trim();
        if (!reviewText) {
            alert("Por favor, insira uma avaliação.");
            reviewInput.focus();
            return;
        }
        startAnalysis(reviewText);
    });
}

// ===============================
// Fluxo principal
// ===============================
async function startAnalysis(text) {
    showLoading();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                texto: text // IMPORTANTE: Java espera "texto"
            })
        });

        if (response.status === 403) throw new Error("Sessão expirada! Faça login novamente.");
        if (!response.ok) throw new Error("Erro ao processar (Status " + response.status + ")");

        const data = await response.json();

        // CORREÇÃO DO NaN 
        // O Java manda "93.06%". Removemos o % e transformamos em número.
        let probNumerica = 0;
        if (typeof data.probabilidade === 'string') {
            probNumerica = parseFloat(data.probabilidade.replace("%", "").replace(",", "."));
        } else {
            probNumerica = data.probabilidade * 100; // Caso venha decimal (0.93)
        }

        finishAnalysis(text, {
            sentiment: capitalize(data.previsao || "Neutro"),
            confidence: Math.round(probNumerica), // Arredonda para inteiro (93)
            keywords: "Análise via IA"
        });

    } catch (err) {
        console.error(err);
        alert(err.message);
        if (err.message.includes("Sessão expirada")) {
            window.location.href = "login.html";
        }
    } finally {
        hideLoading();
    }
}

function finishAnalysis(text, response) {
    displayResult(response);
    addToHistory(text, response);
}

// ===============================
// Exibição do resultado
// ===============================
function displayResult(data) {
    if(!sentimentLabel) return;
    
    sentimentLabel.textContent = data.sentiment;
    confidenceValue.textContent = `${data.confidence}%`;
    
    if(keywords) keywords.textContent = data.keywords;

    updateSentimentStyle(data.sentiment);
    updateConfidenceBar(data.confidence);
    updateAnalysisDate();

    if(result) result.classList.add("show");
}

function updateSentimentStyle(sentiment) {
    if(!sentimentLabel) return;
    sentimentLabel.className = "sentiment-label";

    // Ajuste para bater com o retorno do Python (Positiva/Negativa ou Positivo/Negativo)
    const s = sentiment.toLowerCase();
    if (s.includes("positiv")) {
        sentimentLabel.classList.add("sentiment-positive");
    } else if (s.includes("negativ")) {
        sentimentLabel.classList.add("sentiment-negative");
    } else {
        sentimentLabel.classList.add("sentiment-neutral");
    }
}

function updateConfidenceBar(confidence) {
    if(!confidenceBar) return;
    confidenceBar.className = "confidence-fill";
    confidenceBar.style.width = `${confidence}%`;

    if (confidence >= 80) {
        confidenceBar.classList.add("confidence-high");
    } else if (confidence >= 65) {
        confidenceBar.classList.add("confidence-medium");
    } else {
        confidenceBar.classList.add("confidence-low");
    }
}

function updateAnalysisDate() {
    if(!analysisDate) return;
    const now = new Date();
    analysisDate.textContent = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ===============================
// Histórico
// ===============================
function loadHistoryFromBackend() {
    const token = localStorage.getItem("token");
    if(!token) return; // Não tenta carregar se não tiver token

    fetch("http://localhost:8080/sentiment/history", {
        headers: getAuthHeaders()
    })
    .then(res => {
        if(res.status === 403) return [];
        return res.json();
    })
    .then(data => {
        if (!historyList) return;
        historyList.innerHTML = "";

        if (!data || data.length === 0) {
            if(emptyHistory) emptyHistory.style.display = "block";
            return;
        }

        if(emptyHistory) emptyHistory.style.display = "none";

        data.forEach(item => {
            // Tratamento do histórico também!
            let probHist = 0;
            if (typeof item.probabilidade === 'string') {
                probHist = parseFloat(item.probabilidade.replace("%", "").replace(",", "."));
            } else {
                probHist = item.probabilidade * 100;
            }

            addToHistoryVisualOnly(item.texto, {
                sentiment: capitalize(item.previsao || "Neutro"),
                confidence: Math.round(probHist)
            });
        });
    })
    .catch(err => console.error("Erro histórico", err));
}

function addToHistory(text, data) {
    addToHistoryVisualOnly(text, data);
    if(emptyHistory) emptyHistory.style.display = "none";
}

function addToHistoryVisualOnly(text, data) {
    if(!historyList) return;

    const div = document.createElement("div");
    div.className = "history-item";
    
    let sentimentClass = "sentiment-neutral";
    const s = data.sentiment.toLowerCase();
    if (s.includes("positiv")) sentimentClass = "sentiment-positive";
    if (s.includes("negativ")) sentimentClass = "sentiment-negative";

    div.innerHTML = `
        <div class="history-text">${text}</div>
        <div class="history-sentiment ${sentimentClass}">
            ${data.sentiment} (${data.confidence}%)
        </div>
    `;
    
    historyList.prepend(div);
    if (historyList.children.length > HISTORY_LIMIT) {
        historyList.removeChild(historyList.lastChild);
    }
}

// ===============================
// Inicialização
// ===============================
window.addEventListener("DOMContentLoaded", () => {
    if (charCount) charCount.textContent = 0;
    const token = localStorage.getItem("token");
    if (token) {
        loadHistoryFromBackend();
    }
});