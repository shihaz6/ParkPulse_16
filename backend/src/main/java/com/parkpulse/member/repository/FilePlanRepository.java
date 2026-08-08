package com.parkpulse.member.repository;

import com.parkpulse.member.model.Plan;
import com.parkpulse.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class FilePlanRepository implements PlanRepository {

    private static final String PLANS_FILE = "plans.txt";

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public List<Plan> findAll() {
        return fileStorageService.loadAll(PLANS_FILE, Plan::fromString).stream()
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Optional<Plan> findById(String id) {
        return findAll().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst();
    }

    @Override
    public Plan save(Plan plan) {
        List<Plan> plans = findAll();
        if (plan.getId() == null || plan.getId().isEmpty()) {
            plan.setId("p" + System.currentTimeMillis());
            plans.add(plan);
        } else {
            boolean found = false;
            for (int i = 0; i < plans.size(); i++) {
                if (plans.get(i).getId().equals(plan.getId())) {
                    plans.set(i, plan);
                    found = true;
                    break;
                }
            }
            if (!found) {
                plans.add(plan);
            }
        }
        fileStorageService.saveAll(PLANS_FILE, plans);
        return plan;
    }

    @Override
    public void deleteById(String id) {
        List<Plan> plans = findAll();
        plans.removeIf(p -> p.getId().equals(id));
        fileStorageService.saveAll(PLANS_FILE, plans);
    }

    @Override
    public void saveAll(List<Plan> plans) {
        fileStorageService.saveAll(PLANS_FILE, plans);
    }
}
