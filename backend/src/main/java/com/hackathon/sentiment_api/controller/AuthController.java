package com.hackathon.sentiment_api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import com.hackathon.sentiment_api.dto.RegisterRequest;
import com.hackathon.sentiment_api.dto.LoginRequest; 
import com.hackathon.sentiment_api.service.AuthService;

import java.util.Map; // Para retornar JSON 

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request) {
        service.register(request);
        return ResponseEntity.ok("Usuário criado com sucesso!");
    }

    // ENDPOINT novo: LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Chama o serviço para verificar senha
        String token = service.login(request);
        
        // Retorna um JSON { "token": "..." } para o site entender
        return ResponseEntity.ok(Map.of("token", token));
    }
}