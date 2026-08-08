package com.parkpulse.service;

import com.parkpulse.dto.ReportDTO;
import com.parkpulse.dto.ReportStatsDTO;

import java.util.List;
import java.util.Map;

public interface ReportService {
    Map<String, Object> getReportSummary();
    List<ReportDTO> getReports();
    ReportDTO getReport(Long id);
    ReportStatsDTO getReportStats();
    ReportDTO generateReport(Map<String, Object> request);
    void deleteReport(Long id);
    ReportDTO toggleFixed(Long id, String fixedBy);
    byte[] downloadReport(Long id, String format);
    String getDownloadFilename(Long id);
}
