package com.keralafit.backend.repository;

import com.keralafit.backend.model.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WaterLogRepository extends JpaRepository<WaterLog, UUID> {
    List<WaterLog> findByUserIdOrderByLoggedAtDesc(UUID userId);
    List<WaterLog> findByUserIdAndLoggedAtBetween(UUID userId, LocalDateTime start, LocalDateTime end);
}
