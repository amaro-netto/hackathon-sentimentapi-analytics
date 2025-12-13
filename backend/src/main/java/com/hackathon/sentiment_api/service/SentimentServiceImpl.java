package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.client.PythonClient;
import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import org.springframework.stereotype.Service;

@Service
public class SentimentServiceImpl implements SentimentService {
    
    private final PythonClient client;

    public SentimentServiceImpl(PythonClient client){
        this.client = client;
    }
    
    @Override
    public SentimentResponse analisarTexto(SentimentRequest request) {

        if (request.texto() == null || request.texto().isBlank()) {
            throw new IllegalArgumentException("O campo 'text' é obrigatório.");
            
        }
        return client.analisar(request);
    }
}
