package com.hackathon.sentiment_api.repository;

import com.hackathon.sentiment_api.model.SentimentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface SentimentLogRepository extends JpaRepository<SentimentLog, Long> {

    List<SentimentLog> findTop10ByOrderByDataHoraDesc();
}