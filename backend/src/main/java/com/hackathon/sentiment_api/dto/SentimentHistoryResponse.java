package com.hackathon.sentiment_api.dto;

import java.time.LocalDateTime;

public record SentimentHistoryResponse(Long id,
    String texto,
    String previsao,
    Double probabilidade,
    LocalDateTime createdAt
) {}
