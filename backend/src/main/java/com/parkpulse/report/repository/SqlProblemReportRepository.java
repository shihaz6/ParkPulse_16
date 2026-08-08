package com.parkpulse.report.repository;

import com.parkpulse.report.model.ProblemReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class SqlProblemReportRepository implements ProblemReportRepository {

    @Autowired
    private SpringDataProblemReportRepository springDataProblemReportRepository;

    @Override
    public List<ProblemReport> findAll() {
        return springDataProblemReportRepository.findAll();
    }

    @Override
    public Optional<ProblemReport> findById(Long id) {
        return springDataProblemReportRepository.findById(id);
    }

    @Override
    public ProblemReport save(ProblemReport report) {
        return springDataProblemReportRepository.save(report);
    }

    @Override
    public void deleteById(Long id) {
        springDataProblemReportRepository.deleteById(id);
    }

    @Override
    public long countByStatus(String status) {
        return springDataProblemReportRepository.countByStatus(status);
    }

    @Override
    public List<ProblemReport> findByStatus(String status) {
        return springDataProblemReportRepository.findByStatus(status);
    }
}
