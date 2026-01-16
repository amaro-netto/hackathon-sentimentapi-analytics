package com.hackathon.sentiment_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails { //  Agora ele "veste" a interface de segurança
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String genero;

    @Column(length = 2, nullable = false)
    private String estadoUf;

    @Column(nullable = false)
    private Integer idade;

    // =================================================================
    // CONFIGURAÇÃO DE SEGURANÇA (Obrigatório para o Spring Security)
    // =================================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Define que todo usuário tem o perfil básico de "USER"
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getUsername() {
        // O Spring chama de "Username", mas no nosso sistema é o "Email"
        return email;
    }

    @Override
    public String getPassword() {
        // Retorna a senha criptografada do banco
        return password;
    }

    // Configurações para dizer que a conta está ativa e válida (true)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}