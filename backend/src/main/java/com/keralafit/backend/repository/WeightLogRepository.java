package com.keralafit.backend.repository;

import com.keralafit.backend.model.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WeightLogRepository extends JpaRepository<WeightLog, UUID> {
    List<WeightLog> findByUserIdOrderByLoggedAtDesc(UUID userId);
}
