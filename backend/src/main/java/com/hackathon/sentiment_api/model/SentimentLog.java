package com.hackathon.sentiment_api.model;

import jakarta.persistence.*;
import lombok.*; // <--- O coringa que resolve tudo
import java.time.LocalDateTime;

@Entity
@Data // <--- Substitui @Getter e @Setter e cria os métodos que faltam
@NoArgsConstructor
@Table(name = "sentiment_logs")
public class SentimentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
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

    // --- CONSTRUTOR 1: O Essencial (Usado pelo seu SentimentService) ---
    // Removemos o duplicado e deixamos só este aqui.
    public SentimentLog(String texto, String previsao, Double probabilidade) {
        this.texto = texto;
        this.previsao = previsao;
        this.probabilidade = probabilidade;
        this.dataHora = LocalDateTime.now(); // Garante a data atual
    }

    // --- CONSTRUTOR 2: Completo (Para uso futuro com Auth e Idioma) ---
    public SentimentLog(String texto, String previsao, Double probabilidade, String idioma, Double probIdioma, User user) {
        this.texto = texto;
        this.previsao = previsao;
        this.probabilidade = probabilidade;
        this.idioma = idioma;
        this.probIdioma = probIdioma;
        this.user = user;
        this.dataHora = LocalDateTime.now();
    }
    
    // --- CONSTRUTOR 3: Intermediário (Só com usuário, sem idioma) ---
    public SentimentLog(String texto, String previsao, Double probabilidade, User user) {
        this(texto, previsao, probabilidade, null, null, user);
    }
}