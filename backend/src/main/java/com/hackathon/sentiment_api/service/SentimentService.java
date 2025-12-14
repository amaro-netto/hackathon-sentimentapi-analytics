package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import org.springframework.stereotype.Service;

@Service
public class SentimentService {

    //  Método apenas para o Controller não dar erro de compilação.
    // Na Tarefa 02,  apagar esse "return" e colocar a lógica real.
    public SentimentResponse analisarSentimento(SentimentRequest request) {
        
        // Retorna um dado falso só para testar se a API responde 200 OK
        return new SentimentResponse("Aguardando Implementação ", 0.0);
    }
}