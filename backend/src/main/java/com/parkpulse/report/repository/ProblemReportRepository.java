package com.parkpulse.report.repository;

import com.parkpulse.report.model.ProblemReport;
import java.util.List;
import java.util.Optional;

public interface ProblemReportRepository {
    List<ProblemReport> findAll();
    Optional<ProblemReport> findById(Long id);
    ProblemReport save(ProblemReport report);
    void deleteById(Long id);
    long countByStatus(String status);
    List<ProblemReport> findByStatus(String status);
}
