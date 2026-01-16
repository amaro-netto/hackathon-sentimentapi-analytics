package com.hackathon.sentiment_api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

/**
 * Este DTO age como um Tradutor.
 * O @JsonAlias diz: "Se vier com o nome X do Python, guarde aqui nesta variável".
 */
public record SentimentResponse(
    
    // O Python manda "sentimento", mas nós chamamos de "previsao"
    @JsonAlias("sentimento") 
    String previsao,

    // O Python manda "prob_sentimento", mas nós chamamos de "probabilidade"
    @JsonAlias("prob_sentimento") 
    Object probabilidade
) {}
