package com.hackathon.sentiment_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.ConnectException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // CASO 1: Usuário mandou JSON inválido (ex: texto vazio)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        // Pega exatamente qual campo deu erro
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    // CASO 2: O Python (Data Science) está desligado ou inacessível
    @ExceptionHandler(ConnectException.class)
    public ResponseEntity<Map<String, String>> handleConnectionError(ConnectException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("erro", "Serviço de Inteligência Artificial indisponível.");
        error.put("detalhe", "Não foi possível conectar ao microserviço Python na porta 8000.");
        
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }

    // CASO 3: Erro genérico (qualquer outra coisa que der errado)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericError(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("erro", "Ocorreu um erro interno no servidor.");
        error.put("mensagem", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}