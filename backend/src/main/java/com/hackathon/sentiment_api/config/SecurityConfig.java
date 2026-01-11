package com.hackathon.sentiment_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/",              //  LIBERADO: A raiz do site
                    "/index.html",    //  LIBERADO: O arquivo principal
                    "/sentiment.html",    // LIBERADO: Liberado para todos
                    "/register.html", // PREVENÇÃO: Liberado para criar conta
                    "/style/**",        // LIBERADO: Estilos ( pasta css)
                    "/js/**",         //  LIBERADO: Scripts ( pasta js)
                    "/images/**",     //  LIBERADO: Imagens
                    "/auth/**",       // Login e Registro
                    "/h2-console/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));

            return http.build();
    }
}