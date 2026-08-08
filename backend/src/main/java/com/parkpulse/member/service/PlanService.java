package com.parkpulse.member.service;

import com.parkpulse.member.model.Plan;
import java.util.List;
import java.util.Optional;

public interface PlanService {
    List<Plan> getAllPlans();
    Optional<Plan> getPlanById(String id);
    Optional<Plan> findPlanByName(String name);
    void savePlan(Plan plan);
    void deletePlan(String id);
}
