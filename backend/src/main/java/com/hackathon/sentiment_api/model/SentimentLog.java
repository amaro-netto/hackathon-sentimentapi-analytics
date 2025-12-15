package com.hackathon.sentiment_api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class SentimentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String texto;
    private String previsao;
    private Double probabilidade;
    private LocalDateTime dataHora;

    // Construtor vazio (obrigatório para o JPA)
    public SentimentLog() {}

    // Construtor utilitário
    public SentimentLog(String texto, String previsao, Double probabilidade) {
        this.texto = texto;
        this.previsao = previsao;
        this.probabilidade = probabilidade;
        this.dataHora = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public String getTexto() { return texto; }
    public String getPrevisao() { return previsao; }
    public Double getProbabilidade() { return probabilidade; }
    public LocalDateTime getDataHora() { return dataHora; }
}