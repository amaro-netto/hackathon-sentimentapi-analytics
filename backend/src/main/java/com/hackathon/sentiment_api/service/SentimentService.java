package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.client.PythonClient;
import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import com.hackathon.sentiment_api.model.SentimentLog;
import com.hackathon.sentiment_api.repository.SentimentLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import com.hackathon.sentiment_api.dto.SentimentHistoryResponse;
import java.util.List;

@Service
public class SentimentService {

    private static final Logger log = LoggerFactory.getLogger(SentimentService.class);

    @Autowired
    private PythonClient pythonClient;

    @Autowired
    private SentimentLogRepository repository;

    @Autowired
    @Lazy // Permite que a classe chame seus próprios métodos cacheados
    private SentimentService self;

    /**
     * MÉTODO PÚBLICO (SEM CACHE)
     * Este é o método que o Controller chama.
     * Ele garante que o log seja salvo no banco SEMPRE (mesmo se vier do cache).
     */
    public SentimentResponse analisarSentimento(SentimentRequest request) {
        
        // 1. Tenta pegar a resposta (Do Cache ou do Python)
        // Usamos 'self' para o Spring interceptar a chamada e checar o cache
        SentimentResponse resposta = self.processarAnaliseInterna(request);

        // 2. Salva no Banco (Isso roda TODA VEZ, garantindo auditoria)
        try {
            SentimentLog logBanco = new SentimentLog(
                request.text(), 
                resposta.previsao(), 
                resposta.probabilidade()
            );
            repository.save(logBanco);
            // Logamos o ID para você ver no console que gravou
            log.info("✅ Log salvo no banco! ID: {}", logBanco.getId());
        } catch (Exception e) {
            log.error("Erro ao salvar log no banco", e);
        }

        return resposta;
    }

    /**
     * MÉTODO INTERNO (COM CACHE)
     * O Spring só executa este método se o texto não estiver na memória.
     */
    @Cacheable(value = "sentimentos", key = "#request.text()")
    public SentimentResponse processarAnaliseInterna(SentimentRequest request) {
        log.info("🐍 Cache Miss! Chamando API Python para texto inédito: {}", request.text());
        return pythonClient.analisar(request);
    }

    // Histórico (NOVO MÉTODO)
    public List<SentimentHistoryResponse> listarHistorico() {
        return repository.findTop10ByOrderByDataHoraDesc()
            .stream()
            .map(log -> new SentimentHistoryResponse(
                log.getId(),
                log.getTexto(),
                log.getPrevisao(),
                log.getProbabilidade(),
                log.getDataHora()
            ))
            .toList();
    }
}