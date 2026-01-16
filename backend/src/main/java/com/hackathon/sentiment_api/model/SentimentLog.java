package com.hackathon.sentiment_api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter            
@Setter             
@NoArgsConstructor  
public class SentimentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String texto;
    private String previsao;
    private Double probabilidade;
    private String idioma;
    private Double probIdioma;
    private LocalDateTime dataHora;

    // --- NOVIDADE: A ligação com o Usuário ---
    @ManyToOne
    @JoinColumn(name = "user_id") // Cria uma coluna 'user_id' no banco para guardar o ID do dono
    private User user;

    // Construtor Completo (usuário logado + idioma)
    public SentimentLog(String texto, String previsao, Double probabilidade, String idioma, Double probIdioma, User user) {
        this.texto = texto;
        this.previsao = previsao;
        this.probabilidade = probabilidade;
        this.idioma = idioma;
        this.probIdioma = probIdioma;
        this.user = user;
        this.dataHora = LocalDateTime.now();
    }
    
    // Construtor com usuário (sem idioma)
    public SentimentLog(String texto, String previsao, Double probabilidade, User user) {
        this(texto, previsao, probabilidade, null, null, user);
    }
    
    // Construtor Simples (chame sem usuário)
    public SentimentLog(String texto, String previsao, Double probabilidade) {
        this(texto, previsao, probabilidade, null, null, null);
    }
}