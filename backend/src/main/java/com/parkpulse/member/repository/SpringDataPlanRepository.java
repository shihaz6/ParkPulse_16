package com.parkpulse.member.repository;

import com.parkpulse.member.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataPlanRepository extends JpaRepository<Plan, String> {
    @Query("SELECT DISTINCT p FROM Plan p LEFT JOIN FETCH p.features")
    List<Plan> findAllWithFeatures();
}
