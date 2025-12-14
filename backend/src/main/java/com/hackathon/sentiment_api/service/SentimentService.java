package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.client.PythonClient;
import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SentimentService {

    @Autowired
    private PythonClient pythonClient;

    public SentimentResponse analisarSentimento(SentimentRequest request) {
        //O Java pede para o Python analisar!
        return pythonClient.analisar(request);
    }
}