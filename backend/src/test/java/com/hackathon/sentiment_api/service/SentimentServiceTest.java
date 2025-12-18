package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.client.PythonClient;
import com.hackathon.sentiment_api.dto.SentimentRequest;
import com.hackathon.sentiment_api.dto.SentimentResponse;
import com.hackathon.sentiment_api.model.SentimentLog;
import com.hackathon.sentiment_api.repository.SentimentLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils; // <--- IMPORTANTE

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SentimentServiceTest {

    @Mock
    private PythonClient pythonClient;

    @Mock
    private SentimentLogRepository repository;

    @InjectMocks
    private SentimentService service;

    @BeforeEach
    void setUp() {
        // --- A CORREÇÃO ESTÁ AQUI ---
        // Como não temos o Spring rodando, usamos Reflection para dizer:
        // "Ei serviço, a variável 'self' é você mesmo!"
        ReflectionTestUtils.setField(service, "self", service);
    }

    @Test
    void deveAnalisarSalvarComSucesso() {
        // Cenário
        SentimentRequest request = new SentimentRequest("Teste");
        SentimentResponse response = new SentimentResponse("Positivo", 0.99);

        when(pythonClient.analisar(any())).thenReturn(response);

        // Ação
        service.analisarSentimento(request);

        // Verificação
        verify(repository, times(1)).save(any(SentimentLog.class));
    }

    @Test
    void deveContinuarSeBancoFalhar() {
        // Cenário
        SentimentRequest request = new SentimentRequest("Teste Banco Ruim");
        SentimentResponse response = new SentimentResponse("Neutro", 0.5);

        when(pythonClient.analisar(any())).thenReturn(response);
        // Simula erro no banco
        doThrow(new RuntimeException("Erro Banco")).when(repository).save(any());

        // Ação (Não deve lançar exceção)
        service.analisarSentimento(request);

        // Verificação (O Python foi chamado, mesmo com erro no banco)
        verify(pythonClient, times(1)).analisar(any());
    }
}