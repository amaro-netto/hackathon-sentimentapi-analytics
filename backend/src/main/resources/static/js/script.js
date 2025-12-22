// Elementos DOM
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

// Histórico de análises
let analysisHistory =
    JSON.parse(localStorage.getItem("analysisHistory")) || [];

// Contador de caracteres
reviewInput.addEventListener("input", () => {
    charCount.textContent = reviewInput.value.length;
});

// Classificar avaliação
classifyBtn.addEventListener("click", () => {
    const reviewText = reviewInput.value.trim();

    if (!reviewText) {
        alert("Por favor, insira uma avaliação para classificar.");
        reviewInput.focus();
        return;
    }

    loading.classList.add("show");
    result.classList.remove("show");

    // Simulação de chamada ao backend
    setTimeout(() => {
        const response = simulateClassification(reviewText);

        displayResult(response);
        addToHistory(reviewText, response);

        loading.classList.remove("show");

        localStorage.setItem(
            "analysisHistory",
            JSON.stringify(analysisHistory)
        );
    }, 1200);
});

// Simulação da classificação (3 categorias)
function simulateClassification(text) {
    const positiveWords = [
        "excelente",
        "ótimo",
        "bom",
        "recomendo",
        "rápido",
        "eficiente",
        "maravilhoso",
        "perfeito",
        "adoro",
        "gostei"
    ];

    const negativeWords = [
        "ruim",
        "péssimo",
        "horrível",
        "lento",
        "problema",
        "defeito",
        "decepcionado",
        "não recomendo",
        "terrível",
        "insatisfeito"
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    const words = text.toLowerCase().split(/\W+/);

    words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });

    let sentiment;
    let confidence;

    if (positiveCount > negativeCount) {
        sentiment = "Positiva";
        confidence = 80 + Math.floor(Math.random() * 20);
    } else if (negativeCount > positiveCount) {
        sentiment = "Negativa";
        confidence = 80 + Math.floor(Math.random() * 20);
    } else {
        sentiment = "Neutra";
        confidence = 65 + Math.floor(Math.random() * 20);
    }

    const extractedKeywords = words
        .filter(word => word.length > 4)
        .slice(0, 3)
        .join(", ");

    return {
        sentiment,
        confidence,
        keywords:
            extractedKeywords ||
            "Nenhuma palavra-chave identificada"
    };
}

// Exibir resultado
function displayResult(data) {
    sentimentLabel.textContent = data.sentiment;
    confidenceValue.textContent = `${data.confidence}%`;

    sentimentLabel.className = "sentiment-label";

    if (data.sentiment === "Positiva") {
        sentimentLabel.classList.add("sentiment-positive");
    } else if (data.sentiment === "Negativa") {
        sentimentLabel.classList.add("sentiment-negative");
    } else {
        sentimentLabel.classList.add("sentiment-neutral");
    }

    confidenceBar.style.width = `${data.confidence}%`;
    confidenceBar.className = "confidence-fill";

    if (data.confidence >= 80) {
        confidenceBar.classList.add("confidence-high");
    } else if (data.confidence >= 65) {
        confidenceBar.classList.add("confidence-medium");
    } else {
        confidenceBar.classList.add("confidence-low");
    }

    keywords.textContent = data.keywords;

    const now = new Date();
    analysisDate.textContent =
        now.toLocaleDateString("pt-BR") +
        " " +
        now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

    result.classList.add("show");
}

// Adicionar ao histórico
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

    if (analysisHistory.length > 10) {
        analysisHistory = analysisHistory.slice(0, 10);
    }

    updateHistoryDisplay();
}

// Atualizar histórico
function updateHistoryDisplay() {
    historyList.innerHTML = "";

    if (analysisHistory.length === 0) {
        historyList.appendChild(emptyHistory);
        emptyHistory.style.display = "block";
        return;
    }

    emptyHistory.style.display = "none";

    analysisHistory.forEach(item => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        let sentimentClass = "history-neutral";
        if (item.sentiment === "Positiva") sentimentClass = "history-positive";
        if (item.sentiment === "Negativa") sentimentClass = "history-negative";

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

// Inicialização
window.addEventListener("DOMContentLoaded", () => {
    charCount.textContent = 0;
    updateHistoryDisplay();
});

// Atalho Ctrl+Enter / Cmd+Enter
reviewInput.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        classifyBtn.click();
    }
});