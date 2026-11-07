package com.keralafit.backend.repository;

import com.keralafit.backend.model.StepLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StepLogRepository extends JpaRepository<StepLog, UUID> {
    List<StepLog> findByUserIdOrderByLoggedAtDesc(UUID userId);
    List<StepLog> findByUserIdAndLoggedAtBetween(UUID userId, LocalDateTime start, LocalDateTime end);
}
