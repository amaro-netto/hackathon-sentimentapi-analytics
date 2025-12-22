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

const SENTIMENT_CONFIG = {
    positive: [
        "excelente",
        "otimo",
        "bom",
        "recomendo",
        "rapido",
        "eficiente",
        "maravilhoso",
        "perfeito",
        "adoro",
        "gostei"
    ],
    negative: [
        "ruim",
        "pessimo",
        "horrivel",
        "lento",
        "problema",
        "defeito",
        "decepcionado",
        "terrivel",
        "insatisfeito"
    ],
    negations: ["nao", "nunca", "jamais"],
    stopWords: ["sobre", "muito", "quando", "porque"]
};

// ===============================
// Estado
// ===============================
let analysisHistory =
    JSON.parse(localStorage.getItem("analysisHistory")) || [];

// ===============================
// Utilidades
// ===============================

// Normaliza texto (remove acentos)
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

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

    setTimeout(() => {
        const response = simulateClassification(text);
        finishAnalysis(text, response);
    }, 1200);
}

function finishAnalysis(text, response) {
    displayResult(response);
    addToHistory(text, response);
    saveHistory();
    hideLoading();
}

// ===============================
// Classificação (3 categorias)
// ===============================
function simulateClassification(text) {
    const words = normalizeText(text).split(/\W+/);

    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach((word, index) => {
        const prevWord = words[index - 1];

        if (
            SENTIMENT_CONFIG.positive.includes(word) &&
            !SENTIMENT_CONFIG.negations.includes(prevWord)
        ) {
            positiveCount++;
        }

        if (SENTIMENT_CONFIG.negative.includes(word)) {
            negativeCount++;
        }
    });

    return {
        sentiment: getSentiment(positiveCount, negativeCount),
        confidence: calculateConfidence(positiveCount, negativeCount),
        keywords:
            extractKeywords(words) ||
            "Nenhuma palavra-chave identificada"
    };
}

function getSentiment(positive, negative) {
    if (positive > negative) return "Positiva";
    if (negative > positive) return "Negativa";
    return "Neutra";
}

function calculateConfidence(positive, negative) {
    const total = positive + negative;
    if (total === 0) return 60;

    return Math.min(
        90,
        60 + Math.abs(positive - negative) * 10
    );
}

function extractKeywords(words) {
    return [...new Set(words)]
        .filter(
            word =>
                word.length > 4 &&
                !SENTIMENT_CONFIG.stopWords.includes(word)
        )
        .slice(0, 3)
        .join(", ");
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
    updateHistoryDisplay();
});
