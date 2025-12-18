package com.hackathon.sentiment_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableCaching // Habilitando o gerenciamento de cache
@EnableFeignClients
public class SentimentApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SentimentApiApplication.class, args);
	}

}
