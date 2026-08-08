package com.parkpulse.report.service;

import com.parkpulse.report.model.ProblemReport;
import com.parkpulse.report.repository.ProblemReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProblemReportServiceImpl implements ProblemReportService {

    @Autowired
    private ProblemReportRepository problemReportRepository;

    @Override
    public List<ProblemReport> getAllReports() {
        return problemReportRepository.findAll();
    }

    @Override
    public Optional<ProblemReport> getReportById(Long id) {
        return problemReportRepository.findById(id);
    }

    @Override
    public ProblemReport createReport(ProblemReport report) {
        return problemReportRepository.save(report);
    }

    @Override
    public ProblemReport updateReport(Long id, ProblemReport report) {
        return problemReportRepository.findById(id).map(existing -> {
            existing.setTitle(report.getTitle());
            existing.setDescription(report.getDescription());
            existing.setStatus(report.getStatus());
            if ("RESOLVED".equalsIgnoreCase(report.getStatus()) || "CLOSED".equalsIgnoreCase(report.getStatus())) {
                existing.setResolvedAt(LocalDateTime.now());
                existing.setResolvedBy(report.getResolvedBy());
            }
            return problemReportRepository.save(existing);
        }).orElse(null);
    }

    @Override
    public void deleteReport(Long id) {
        problemReportRepository.deleteById(id);
    }

    @Override
    public long getPendingCount() {
        return problemReportRepository.countByStatus("PENDING");
    }

    @Override
    public List<ProblemReport> getReportsByStatus(String status) {
        return problemReportRepository.findByStatus(status);
    }
}
