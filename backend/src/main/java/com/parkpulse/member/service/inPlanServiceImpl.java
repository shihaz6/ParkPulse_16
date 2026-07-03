package com.parkpulse.member.service;

import com.parkpulse.member.model.Plan;
import com.parkpulse.member.repository.PlanRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class inPlanServiceImpl implements PlanService {

    @Autowired
    private PlanRepository planRepository;

    @PostConstruct
    public void init() {
        // No default plans — admin must create plans via Settings > Plans
    }

    @Override
    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    @Override
    public Optional<Plan> getPlanById(String id) {
        return planRepository.findById(id);
    }

    @Override
    public Optional<Plan> findPlanByName(String name) {
        return planRepository.findAll().stream()
                .filter(p -> p.getName().equalsIgnoreCase(name))
                .findFirst();
    }

    @Override
    public void savePlan(Plan plan) {
        planRepository.save(plan);
    }

    @Override
    public void deletePlan(String id) {
        planRepository.deleteById(id);
    }
}
