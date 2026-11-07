package com.keralafit.backend.repository;

import com.keralafit.backend.model.FoodLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FoodLogRepository extends JpaRepository<FoodLog, UUID> {
    List<FoodLog> findByUserIdOrderByLoggedAtDesc(UUID userId);
    List<FoodLog> findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(
        UUID userId, LocalDateTime start, LocalDateTime end);
}
