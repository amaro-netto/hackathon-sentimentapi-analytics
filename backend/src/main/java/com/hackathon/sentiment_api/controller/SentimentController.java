package com.hackathon.sentiment_api.controller;

import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import com.hackathon.sentiment_api.service.SentimentService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sentiment") // Define a rota base /sentiment
public class SentimentController {

    @Autowired
    private SentimentService service;

    @PostMapping
    public ResponseEntity<SentimentResponse> processarSentimento(@RequestBody @Valid SentimentRequest request) {
        // O @Valid ali em cima garante que se o texto vier vazio, o Spring barra antes de chegar aqui.
        
        // Chama o esqueleto do serviço
        SentimentResponse resposta = service.analisarSentimento(request);
        
        return ResponseEntity.ok(resposta);
    }
}
