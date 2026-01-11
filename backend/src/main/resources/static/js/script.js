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

    if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "index.html";
        throw new Error("Token não encontrado");
    }

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

function showLoading() {
    loading.classList.add("show");
    result.classList.remove("show");
}

function hideLoading() {
    loading.classList.remove("show");
}

function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ===============================
// Eventos
// ===============================
reviewInput.addEventListener("input", () => {
    charCount.textContent = reviewInput.value.length;
});

reviewInput.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        classifyBtn.click();
    }
});

classifyBtn.addEventListener("click", () => {
    const reviewText = reviewInput.value.trim();

    if (!reviewText) {
        alert("Por favor, insira uma avaliação.");
        reviewInput.focus();
        return;
    }

    startAnalysis(reviewText);
});

// ===============================
// Fluxo principal
// ===============================
function startAnalysis(text) {
    showLoading();

    fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ texto: text })
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Erro ao processar sentimento");
            }
            return res.json();
        })
        .then(data => {
            finishAnalysis(text, {
                sentiment: capitalize(data.previsao),
                confidence: Math.round(data.probabilidade * 100),
                keywords: "Análise via IA"
            });
        })
        .catch(err => {
            console.error(err);
            alert("Erro ao conectar com o servidor.");
            hideLoading();
        });
}

function finishAnalysis(text, response) {
    displayResult(response);
    addToHistory(text, response);
    hideLoading();
}

// ===============================
// Exibição do resultado
// ===============================
function displayResult(data) {
    sentimentLabel.textContent = data.sentiment;
    confidenceValue.textContent = `${data.confidence}%`;
    keywords.textContent = data.keywords;

    updateSentimentStyle(data.sentiment);
    updateConfidenceBar(data.confidence);
    updateAnalysisDate();

    result.classList.add("show");
}

function updateSentimentStyle(sentiment) {
    sentimentLabel.className = "sentiment-label";

    if (sentiment === "Positiva") {
        sentimentLabel.classList.add("sentiment-positive");
    } else if (sentiment === "Negativa") {
        sentimentLabel.classList.add("sentiment-negative");
    } else {
        sentimentLabel.classList.add("sentiment-neutral");
    }
}

function updateConfidenceBar(confidence) {
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
    const now = new Date();
    analysisDate.textContent =
        now.toLocaleDateString("pt-BR") +
        " " +
        now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
}

// ===============================
// Histórico
// ===============================
function loadHistoryFromBackend() {
    fetch("http://localhost:8080/sentiment/history", {
        headers: getAuthHeaders()
    })
        .then(res => res.json())
        .then(data => {
            historyList.innerHTML = "";

            data.forEach(item => {
                const div = document.createElement("div");
                div.className = "history-item";
                div.innerHTML = `
                    <div class="history-text">${item.texto}</div>
                    <div class="history-sentiment">${item.previsao}</div>
                `;
                historyList.appendChild(div);
            });
        })
        .catch(err => {
            console.error("Erro ao carregar histórico", err);
        });
}

// ===============================
// Inicialização
// ===============================
window.addEventListener("DOMContentLoaded", () => {
    charCount.textContent = 0;
    loadHistoryFromBackend();
});
