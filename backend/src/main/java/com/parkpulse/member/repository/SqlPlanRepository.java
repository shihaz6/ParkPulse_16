package com.parkpulse.member.repository;

import com.parkpulse.member.model.Plan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class SqlPlanRepository implements PlanRepository {

    @Autowired
    private SpringDataPlanRepository springDataPlanRepository;

    @Override
    public List<Plan> findAll() {
        return springDataPlanRepository.findAllWithFeatures();
    }

    @Override
    public Optional<Plan> findById(String id) {
        return springDataPlanRepository.findById(id);
    }

    @Override
    public Plan save(Plan plan) {
        return springDataPlanRepository.save(plan);
    }

    @Override
    public void deleteById(String id) {
        springDataPlanRepository.deleteById(id);
    }

    @Override
    public void saveAll(List<Plan> plans) {
        springDataPlanRepository.saveAll(plans);
    }
}
