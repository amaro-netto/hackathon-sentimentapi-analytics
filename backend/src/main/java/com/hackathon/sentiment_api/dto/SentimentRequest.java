package com.hackathon.sentiment_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size; // importação nova necessária

public record SentimentRequest(
    @NotBlank(message = "O texto é obrigatório")
    @Size(min = 3, max = 500, message = "O texto deve ter entre 3 e 500 caracteres") // 🔒 Blindagem contra textos gigantes
    @JsonProperty("texto") // resolve o erro 422
    String text
) {
}