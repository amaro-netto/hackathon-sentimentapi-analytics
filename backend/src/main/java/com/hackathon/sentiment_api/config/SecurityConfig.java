package com.hackathon.sentiment_api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // --- Rota Pública: Arquivos estáticos e Login ---
                .requestMatchers(
                    "/",
                    "/index.html", 
                    "/register.html",
                    "/login.html",
                    "/sentiment.html",
                    "/style/**",
                    "/js/**",
                    "/images/**",
                    "/auth/**",      // Importante: Login e Registro liberados
                    "/h2-console/**",
                    "/v3/api-docs/**", "/swagger-ui/**"
                ).permitAll()
                
                //Rota Protegida: Todo o resto precisa de Token 
                .anyRequest().authenticated()
            )
            // Desativa a sessão padrão (Stateful) porque JWT é Stateless
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Define qual Provedor de Autenticação usar
            .authenticationProvider(authenticationProvider)
            
            // Adiciona o NOSSO filtro antes do filtro padrão do Spring
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Configuração para o H2 Console funcionar (frames)
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}