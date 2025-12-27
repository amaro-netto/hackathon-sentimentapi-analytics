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
// Estado
// ===============================
let analysisHistory =
    JSON.parse(localStorage.getItem("analysisHistory")) || [];

// ===============================
// Utilidades
// ===============================
function showLoading() {
    loading.classList.add("show");
    result.classList.remove("show");
}

function hideLoading() {
    loading.classList.remove("show");
}

function saveHistory() {
    localStorage.setItem(
        "analysisHistory",
        JSON.stringify(analysisHistory)
    );
}

function capitalize(text) {
    if(!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ===============================
// Eventos
// ===============================

// Contador de caracteres
reviewInput.addEventListener("input", () => {
    charCount.textContent = reviewInput.value.length;
});

// Atalho Ctrl+Enter / Cmd+Enter
reviewInput.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        classifyBtn.click();
    }
});

// Clique no botão de classificar
classifyBtn.addEventListener("click", () => {
    const reviewText = reviewInput.value.trim();

    if (!reviewText) {
        alert("Por favor, insira uma avaliação para classificar.");
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
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            texto: text 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(
                "Erro ao processar sentimento");
        }
        return response.json();
    })
    .then(data => {
        const adaptedResponse = {
            sentiment: capitalize(data.previsao),
            confidence: Math.round(data.probabilidade * 100),
            keywords: "Análise via IA"
        };
        finishAnalysis(text, adaptedResponse);
    })
    .catch(error => {
        console.error(error);
        alert("Erro ao conectar com o servidor.");
        hideLoading();
    });
}

    function finishAnalysis(text, response) {
    displayResult(response);
    addToHistory(text, response);
    saveHistory();
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
    fetch("http://localhost:8080/sentiment/history")
        .then(res => res.json())
        .then(data => {
            analysisHistory = data.map(item => ({
                id: item.id,
                text: item.texto.length > 100
                ? item.texto.substring(0,100) + "..."
                : item.texto,
                fullText: item.texto,
                sentiment: item.previsao,
                confidence: Math.round(item.probabilidade * 100),
                date: new Date(item.dataHora).toLocaleString("pt-BR")
            }));
            updateHistoryDisplay();
        })
        .catch(err => {
            console.error("Erro ao carregar histórico", err);
        });
}

function addToHistory(text, data) {
    const analysis = {
        id: Date.now(),
        text:
            text.length > 100
                ? text.substring(0, 100) + "..."
                : text,
        fullText: text,
        sentiment: data.sentiment,
        confidence: data.confidence,
        date: new Date().toLocaleString("pt-BR")
    };

    analysisHistory.unshift(analysis);
    analysisHistory = analysisHistory.slice(0, HISTORY_LIMIT);

    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = "";

    if (analysisHistory.length === 0) {
        emptyHistory.style.display = "block";
        historyList.appendChild(emptyHistory);
        return;
    }

    emptyHistory.style.display = "none";

    analysisHistory.forEach(item => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const sentimentClass =
            item.sentiment === "Positiva"
                ? "history-positive"
                : item.sentiment === "Negativa"
                ? "history-negative"
                : "history-neutral";

        historyItem.innerHTML = `
            <div class="history-text">${item.text}</div>
            <div class="history-sentiment ${sentimentClass}">
                ${item.sentiment}
            </div>
        `;

        historyItem.addEventListener("click", () => {
            reviewInput.value = item.fullText;
            charCount.textContent = item.fullText.length;

            displayResult({
                sentiment: item.sentiment,
                confidence: item.confidence,
                keywords: "Recuperado do histórico"
            });

            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        historyList.appendChild(historyItem);
    });
}

// ===============================
// Inicialização
// ===============================
window.addEventListener("DOMContentLoaded", () => {
    charCount.textContent = 0;
    loadHistoryFromBackend();
});
