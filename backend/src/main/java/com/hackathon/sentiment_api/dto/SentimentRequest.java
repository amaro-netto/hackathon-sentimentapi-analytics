package com.hackathon.sentiment_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty; 
import jakarta.validation.constraints.NotBlank;

public record SentimentRequest(
    @NotBlank(message = "O texto é obrigatório")
    @JsonProperty("texto") // resolve o erro 422
    String text
) {
}
