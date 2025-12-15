package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.client.PythonClient;
import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import com.hackathon.sentiment_api.model.SentimentLog;          // ADICIONADO
import com.hackathon.sentiment_api.repository.SentimentLogRepository; // ADICIONADO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SentimentService {

    @Autowired
    private PythonClient pythonClient;

    @Autowired                                  
    private SentimentLogRepository repository;  // ADICIONADO: Injetamos o banco aqui

    

    public SentimentResponse analisarSentimento(SentimentRequest request) {
        //O Java pede para o Python analisar!
        SentimentResponse resposta = pythonClient.analisar(request);
        
        //  Salvar o Log no Banco H2
        try {
            SentimentLog log = new SentimentLog(
                request.text(),             
                resposta.previsao(),         
                resposta.probabilidade()
            );
            
            repository.save(log);
            System.out.println("✅ Log salvo no banco! ID: " + log.getId());
            
        } catch (Exception e) {
            // Se der erro no banco, apenas avisamos no console e não travamos a resposta
            System.err.println("⚠️ Erro ao salvar log (mas a análise funcionou): " + e.getMessage());
        }

        return resposta;
    }
}