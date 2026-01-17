package com.hackathon.sentiment_api.controller;

import com.hackathon.sentiment_api.dto.SentimentHistoryResponse;
import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import com.hackathon.sentiment_api.service.SentimentService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // Importei tudo de web para limpar
import java.util.List;

@RestController
@RequestMapping("/api/sentiments")
@CrossOrigin(origins = "*") // Segurança:Para evitar  erro de CORS se o front estiver em outra porta
public class SentimentController {

    private final SentimentService service;

    //Refatoração: Injeção via Construtor (usei padrão 'Clean Code')
    public SentimentController(SentimentService service) {
        this.service = service;
    }
    
    @PostMapping
    public ResponseEntity<SentimentResponse> processarSentimento(@RequestBody @Valid SentimentRequest request) {
        SentimentResponse resposta = service.analisarSentimento(request);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping // <--- CORRIGIDO: Removemos "/history" para bater com o GET raiz
    public ResponseEntity<List<SentimentHistoryResponse>> listarHistorico() {
        List<SentimentHistoryResponse> lista = service.listarHistorico();
        if (lista == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(lista);
    }
}