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
    private LocalDateTime dataHora;

    // --- NOVIDADE: A ligação com o Usuário ---
    @ManyToOne
    @JoinColumn(name = "user_id") // Cria uma coluna 'user_id' no banco para guardar o ID do dono
    private User user;

    // Construtor Completo ( usuário logado)
    public SentimentLog(String texto, String previsao, Double probabilidade, User user) {
        this.texto = texto;
        this.previsao = previsao;
        this.probabilidade = probabilidade;
        this.user = user;
        this.dataHora = LocalDateTime.now();
    }
    
    // Construtor Simples (chame sem usuário)
    public SentimentLog(String texto, String previsao, Double probabilidade) {
        this(texto, previsao, probabilidade, null);
    }
}