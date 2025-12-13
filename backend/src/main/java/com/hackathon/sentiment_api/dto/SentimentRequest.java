package com.hackathon.sentiment_api.dto;

import jakarta.validation.constraints.NotBlank;

public record SentimentRequest(
    @NotBlank(message = "O texto é obrigatório")
    String texto
) {
    //"texto": "Adorei o atendimento!"
}
