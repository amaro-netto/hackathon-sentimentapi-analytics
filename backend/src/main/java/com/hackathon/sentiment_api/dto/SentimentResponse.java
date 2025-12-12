package com.hackathon.sentiment_api.dto;

public record SentimentResponse(
    String previsao,      // Ex: "Positivo"
    Double probabilidade  // Ex: 0.98
) {}

