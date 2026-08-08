package com.parkpulse.report.repository;

import com.parkpulse.report.model.ProblemReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataProblemReportRepository extends JpaRepository<ProblemReport, Long> {
    long countByStatus(String status);
    List<ProblemReport> findByStatus(String status);
}
