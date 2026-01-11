package com.hackathon.sentiment_api.service;

import com.hackathon.sentiment_api.dto.RegisterRequest;
import com.hackathon.sentiment_api.dto.LoginRequest; 
import com.hackathon.sentiment_api.model.User;
import com.hackathon.sentiment_api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {
    
    private final UserRepository repository;
    private final PasswordEncoder enconder;

    public AuthService(UserRepository repository, PasswordEncoder enconder) {
        this.repository = repository;
        this.enconder = enconder;
    }

    public void register(RegisterRequest request) {
        if(repository.existsByEmail(request.email())) {
            throw new RuntimeException("Email já cadastrado");
        }
        validarSenha(request.password());
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(enconder.encode(request.password()));
        user.setGenero(request.genero());
        user.setEstadoUf(request.estadoUf());
        user.setIdade(request.idade());
        repository.save(user);
    }

    // NOVO MÉTODO: LOGIN
    public String login(LoginRequest request) {
        // 1. Busca o usuário no banco
        User user = repository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verifica se a senha bate (A senha do banco está criptografada!)
        if (!enconder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Senha incorreta");
        }

        // Retorna um Token (Por enquanto um simples, depois põe o JWT real)
        return "TOKEN_DE_ACESSO_" + user.getId(); 
    }

    private void validarSenha(String senha) {
        if(senha.length() < 8 || !senha.matches(".*\\d.*")) {
            throw new RuntimeException("Senha deve ter ao menos 8 caracteres e 1 número");
        }
    }
}