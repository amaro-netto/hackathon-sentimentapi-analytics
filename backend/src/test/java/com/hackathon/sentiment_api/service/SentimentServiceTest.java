package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.client.PythonClient;
import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import com.hackathon.sentiment_api.model.SentimentLog;
import com.hackathon.sentiment_api.repository.SentimentLogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SentimentServiceTest {

    @Mock
    private PythonClient pythonClient;

    @Mock
    private SentimentLogRepository repository;

    @InjectMocks
    private SentimentService sentimentService;

    // TESTE 1: SUCESSO (Caminho Feliz)
    @Test
    @DisplayName("Sucesso: Analisa sentimento e salva no banco")
    void deveAnalisarSalvarComSucesso() {
        SentimentRequest request = new SentimentRequest("Java é top");
        SentimentResponse respostaMock = new SentimentResponse("POSITIVO", 0.99);

        when(pythonClient.analisar(request)).thenReturn(respostaMock);

        SentimentResponse resultado = sentimentService.analisarSentimento(request);

        assertEquals("POSITIVO", resultado.previsao());
        verify(repository, times(1)).save(any(SentimentLog.class));
    }

    // TESTE 2: RESILIÊNCIA (Erro no Banco)
    @Test
    @DisplayName("Resiliência: Erro no banco não deve parar a aplicação")
    void deveContinuarSeBancoFalhar() {
        SentimentRequest request = new SentimentRequest("Teste erro banco");
        SentimentResponse respostaMock = new SentimentResponse("NEUTRO", 0.50);

        when(pythonClient.analisar(request)).thenReturn(respostaMock);
        
        // Simula erro ao salvar
        doThrow(new RuntimeException("Erro Conexão")).when(repository).save(any());

        SentimentResponse resultado = sentimentService.analisarSentimento(request);

        // Se chegar aqui sem erro, o teste passou
        assertEquals("NEUTRO", resultado.previsao());
        verify(repository, times(1)).save(any());
    }
}
