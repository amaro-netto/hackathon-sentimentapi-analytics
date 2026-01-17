package com.hackathon.sentiment_api.dto;

import java.time.LocalDateTime;

public record SentimentHistoryResponse(Long id,
    String texto,
    String previsao,
    Double probabilidade,
    String idioma,
    Double probIdioma,
    LocalDateTime createdAt,
    UserSummary usuario
) {
    // Record interno para agrupar dados do usuário de forma limpa
    public record UserSummary(String estado_uf, String genero) {}
}
