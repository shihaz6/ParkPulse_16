package com.parkpulse.member.repository;

import com.parkpulse.member.model.Plan;
import java.util.List;
import java.util.Optional;

public interface PlanRepository {
    List<Plan> findAll();
    Optional<Plan> findById(String id);
    Plan save(Plan plan);
    void deleteById(String id);
    void saveAll(List<Plan> plans);
}
