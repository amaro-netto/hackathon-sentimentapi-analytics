package com.hackathon.sentiment_api.repository;

import com.hackathon.sentiment_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; 

public interface UserRepository extends JpaRepository<User, Long> {
    
    // Adicionei o método que estava faltando
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
}
