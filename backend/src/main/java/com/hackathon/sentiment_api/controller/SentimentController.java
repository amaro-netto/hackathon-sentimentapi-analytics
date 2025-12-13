package com.hackathon.sentiment_api.controller;

import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import com.hackathon.sentiment_api.service.SentimentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sentiment")
public class SentimentController {
    
    private final SentimentService service;

    public SentimentController(SentimentService service){
        this.service = service;
    }

    @PostMapping
    public SentimentResponse analisar(@RequestBody SentimentRequest request){
        return service.analisarTexto(request);
    }
}
