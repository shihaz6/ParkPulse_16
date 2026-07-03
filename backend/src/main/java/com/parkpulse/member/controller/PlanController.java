package com.parkpulse.member.controller;

import com.parkpulse.member.dto.PlanDTO;
import com.parkpulse.member.model.Plan;
import com.parkpulse.member.service.PlanService;
import com.parkpulse.util.DtoMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")
public class PlanController {

    @Autowired
    private PlanService planService;

    @GetMapping
    public List<PlanDTO> getAllPlans() {
        return planService.getAllPlans().stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<PlanDTO> savePlan(@Valid @RequestBody PlanDTO planDTO) {
        Plan plan = DtoMapper.toEntity(planDTO);
        planService.savePlan(plan);
        return ResponseEntity.ok(DtoMapper.toDto(plan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanDTO> updatePlan(@PathVariable String id, @Valid @RequestBody PlanDTO planDTO) {
        Plan plan = DtoMapper.toEntity(planDTO);
        plan.setId(id);
        planService.savePlan(plan);
        return ResponseEntity.ok(DtoMapper.toDto(plan));
    }

    @PostMapping("/calculate-savings")
    public ResponseEntity<Integer> calculateSavings(@RequestBody PlanDTO planDTO) {
        Plan plan = DtoMapper.toEntity(planDTO);
        return ResponseEntity.ok(plan.calculateAnnualSavingsPercent());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable String id) {
        planService.deletePlan(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanDTO> getPlan(@PathVariable String id) {
        return planService.getPlanById(id)
                .map(DtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
