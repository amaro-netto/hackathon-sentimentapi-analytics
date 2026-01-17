package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.config.JwtService;
import com.hackathon.sentiment_api.dto.LoginRequest;
import com.hackathon.sentiment_api.dto.RegisterRequest;
import com.hackathon.sentiment_api.model.User;
import com.hackathon.sentiment_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; 
    private final AuthenticationManager authenticationManager; 

    public void register(RegisterRequest request) {
        if(repository.existsByEmail(request.email())) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        validarSenha(request.password());
        
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setGenero(request.genero());
        user.setEstadoUf(request.estadoUf());
        user.setIdade(request.idade());
        
        repository.save(user);
    }

    public String login(LoginRequest request) {
        // Spring Security verifica se a senha bate com a criptografia do banco
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password()
            )
        );

        //Se a senha estiver certa, busca o usuário
        var user = repository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Gera um JWT Real!
        return jwtService.generateToken(user);
    }

    private void validarSenha(String senha) {
        if(senha.length() < 8 || !senha.matches(".*\\d.*")) {
            throw new RuntimeException("Senha deve ter ao menos 8 caracteres e 1 número");
        }
    }
}