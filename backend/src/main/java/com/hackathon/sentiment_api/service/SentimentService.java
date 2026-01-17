package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.client.PythonClient;
import com.hackathon.sentiment_api.dto.SentimentHistoryResponse;
import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import com.hackathon.sentiment_api.model.SentimentLog;
import com.hackathon.sentiment_api.model.User;
import com.hackathon.sentiment_api.repository.SentimentLogRepository;
import com.hackathon.sentiment_api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SentimentService {

    private static final Logger log = LoggerFactory.getLogger(SentimentService.class);

    @Autowired
    private PythonClient pythonClient;

    @Autowired
    private SentimentLogRepository logRepository;
    
    @Autowired
    private UserRepository userRepository; // FERRAMENTA NOVA -> Para achar o dono do log

    @Autowired
    @Lazy
    private SentimentService self;

    public SentimentResponse analisarSentimento(SentimentRequest request) {
        
        //Processa (Chama o Python ou pega do Cache)
        SentimentResponse resposta = self.processarAnaliseInterna(request);

        //Tratamento de Segurança para Probabilidade (Evita erro se vier texto do Python)
        Double probParaBanco = 0.0;
        try {
            Object p = resposta.probabilidade();
            if (p instanceof Number) {
                probParaBanco = ((Number) p).doubleValue();
            } else if (p instanceof String) {
                // Se vier "99.9%" ou "0,99" como texto, nós limpamos
                String pStr = (String) p;
                pStr = pStr.replace("%", "").replace(",", ".");
                probParaBanco = Double.parseDouble(pStr);
            }
        } catch (Exception e) {
            log.warn("⚠️ Conversão de probabilidade falhou, salvando 0.0");
        }

        //Tratamento de Segurança para Probabilidade de Idioma
        Double probIdiomaParaBanco = 0.0;
        try {
            Object pi = resposta.probIdioma();
            if (pi instanceof Number) {
                probIdiomaParaBanco = ((Number) pi).doubleValue();
            } else if (pi instanceof String) {
                String piStr = (String) pi;
                piStr = piStr.replace("%", "").replace(",", ".");
                probIdiomaParaBanco = Double.parseDouble(piStr);
            }
        } catch (Exception e) {
            log.warn("⚠️ Conversão de probabilidade de idioma falhou, salvando 0.0");
        }

        // Descobre QUEM está logado (User Context) 
        User usuarioLogado = null;
        try {
            // Pergunta para a Segurança "Quem é que está com o token?"
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Só busca no banco se não for usuário anônimo
            if (email != null && !email.equals("anonymousUser")) {
                usuarioLogado = userRepository.findByEmail(email).orElse(null);
            }
        } catch (Exception e) {
            log.warn("⚠️ Não foi possível identificar o usuário (acesso sem token?)");
        }

        // Salva no Banco com a assinatura do Usuário
        try {
            //  Usando o Novo Construtor que aceita o USUÁRIO + idioma
            SentimentLog logBanco = new SentimentLog(
                request.text(), 
                resposta.previsao(), 
                probParaBanco,
                resposta.idioma(),
                probIdiomaParaBanco,
                usuarioLogado // <- Vincula o log ao usuário!
            );
            logRepository.save(logBanco);
            
            String nomeUsuario = (usuarioLogado != null) ? usuarioLogado.getEmail() : "Anônimo";
            log.info("✅ Log salvo! ID: {} | Usuário: {} | Idioma: {}", logBanco.getId(), nomeUsuario, resposta.idioma());
            
        } catch (Exception e) {
            log.error(" Erro ao salvar log no banco", e);
        }

        return resposta;
    }

    @Cacheable(value = "sentimentos", key = "#request.text()")
    public SentimentResponse processarAnaliseInterna(SentimentRequest request) {
        log.info(" Cache Miss! Chamando Python para: {}", request.text());
        return pythonClient.analisar(request);
    }

    public List<SentimentHistoryResponse> listarHistorico() {
        // 1. Mudei de findTop10 para findAll() para trazer os 50 registros
        // Se quiser manter ordenado: logRepository.findAll(Sort.by(Sort.Direction.DESC, "dataHora"));
        // Mas o findAll() padrão já serve para testar quantidade.
        List<SentimentLog> logs = logRepository.findAll();

        return logs.stream().map(l -> {
            // Extrai dados do usuário com segurança (caso seja log antigo sem user)
            String estado = "N/A";
            String genero = "Outro";
            
            if (l.getUser() != null) {
                estado = l.getUser().getEstadoUf(); // Pega do User.java
                genero = l.getUser().getGenero();   // Pega do User.java
            }

            return new SentimentHistoryResponse(
                l.getId(), 
                l.getTexto(), 
                l.getPrevisao(), 
                l.getProbabilidade(), 
                l.getIdioma(), 
                l.getProbIdioma(), 
                l.getDataHora(),
                // Preenche o novo objeto de Usuário
                new SentimentHistoryResponse.UserSummary(estado, genero)
            );
        }).collect(Collectors.toList());
    }
}