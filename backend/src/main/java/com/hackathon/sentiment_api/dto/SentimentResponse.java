package com.hackathon.sentiment_api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true) // Ignora campos extras que o Python possa mandar

/**
 * Este DTO age como um Tradutor.
 * O @JsonAlias diz: "Se vier com o nome X do Python, guarde aqui nesta variável".
 */
public record SentimentResponse(
    
    // O Python manda "sentimento", mas nós chamamos de "previsao"
    @JsonAlias({"sentimento", "sentiment", "previsao", "label", "result"}) 
    String previsao,

    // O Python manda "prob_sentimento", mas nós chamamos de "probabilidade"
    @JsonAlias({"prob_sentimento", "probabilidade", "confidence", "score", "probability"}) 
    Object probabilidade,

    // O Python manda "idioma"
    @JsonAlias({"idioma", "language", "lang"})
    String idioma,

    // O Python manda "prob_idioma"
    @JsonAlias({"prob_idioma", "language_confidence", "probIdioma", "language_score"})
    Object probIdioma
) {}
