package com.hackathon.sentiment_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    
    @NotBlank
    @Email
    String email,

    @NotBlank
    String password,
    
    @NotBlank
    String genero,
    
    @NotBlank
    @Size(min = 2, max = 2)
    String estadoUf,

    @NotNull
    @Min(13)
    @Max(120)
    Integer idade
) {}
