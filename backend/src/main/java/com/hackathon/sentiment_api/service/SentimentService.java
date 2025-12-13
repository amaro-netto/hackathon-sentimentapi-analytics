package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;

public interface SentimentService {
    SentimentResponse analisarTexto(SentimentRequest request);
}
