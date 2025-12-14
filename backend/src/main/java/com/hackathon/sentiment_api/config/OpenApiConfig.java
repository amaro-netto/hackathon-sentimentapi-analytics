package com.hackathon.sentiment_api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sentiment API - Hackathon Team")
                        .version("1.0.0")
                        .description("API para análise de sentimentos integrada com modelo de Machine Learning (Python).")
                        .contact(new Contact()
                                .name("Time Backend")
                                .email("seu-email@hackathon.com")));
    }
}