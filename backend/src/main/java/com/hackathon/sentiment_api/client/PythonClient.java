package com.hackathon.sentiment_api.client;

import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "python-api", url = "${app.ds-url}") //http://localhost:8000->Padrão do Python/Flask
public interface PythonClient {
    
    @PostMapping("/predict") // Endpoint que o grupo de Data Science criar (ex: /predict)
    SentimentResponse analisar(@RequestBody SentimentRequest request);
}
