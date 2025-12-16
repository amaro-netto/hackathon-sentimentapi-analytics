package com.hackathon.sentiment_api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hackathon.sentiment_api.client.PythonClient;
import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import com.hackathon.sentiment_api.model.SentimentLog;          // ADICIONADO
import com.hackathon.sentiment_api.repository.SentimentLogRepository; // ADICIONADO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SentimentService {

    private static final Logger log = LoggerFactory.getLogger(SentimentService.class);
    
    @Autowired
    private PythonClient pythonClient;

    @Autowired                                  
    private SentimentLogRepository repository;  // ADICIONADO: Injetamos o banco aqui


    public SentimentResponse analisarSentimento(SentimentRequest request) {
        
        log.info("Iniciando análise de sentimento");
        
        //O Java pede para o Python analisar!
        SentimentResponse resposta = pythonClient.analisar(request);
        
        //  Salvar o Log no Banco H2
        try {
            SentimentLog logEntity = new SentimentLog(
                request.text(),             
                resposta.previsao(),         
                resposta.probabilidade()
            );
            
            repository.save(logEntity);
            log.info("Log salvo no banco com sucesso. id={}", logEntity.getId());
            
        } catch (Exception e) {
            // Não quebra o fluxo principal, apenas registra o erro corretamente.
            log.error("Erro ao salvar log no banco (análise retornada com sucesso)", e);
        }

        log.info("Análise de sentimento concluída");

        return resposta;
    }
}