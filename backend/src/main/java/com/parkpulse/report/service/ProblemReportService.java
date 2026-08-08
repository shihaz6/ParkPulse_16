package com.parkpulse.report.service;

import com.parkpulse.report.model.ProblemReport;
import java.util.List;
import java.util.Optional;

public interface ProblemReportService {
    List<ProblemReport> getAllReports();
    Optional<ProblemReport> getReportById(Long id);
    ProblemReport createReport(ProblemReport report);
    ProblemReport updateReport(Long id, ProblemReport report);
    void deleteReport(Long id);
    long getPendingCount();
    List<ProblemReport> getReportsByStatus(String status);
}
