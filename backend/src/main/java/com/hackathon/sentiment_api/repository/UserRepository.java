package com.hackathon.sentiment_api.repository;

import com.hackathon.sentiment_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    
}
