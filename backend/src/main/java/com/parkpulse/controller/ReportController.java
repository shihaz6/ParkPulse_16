package com.parkpulse.controller;

import com.parkpulse.dto.ReportDTO;
import com.parkpulse.dto.ReportStatsDTO;
import com.parkpulse.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(reportService.getReportSummary());
    }

    @GetMapping
    public ResponseEntity<?> getReports() {
        return ResponseEntity.ok(reportService.getReports());
    }

    @GetMapping("/stats")
    public ResponseEntity<ReportStatsDTO> getStats() {
        return ResponseEntity.ok(reportService.getReportStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReport(@PathVariable Long id) {
        ReportDTO report = reportService.getReport(id);
        if (report == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Report not found"));
        }
        return ResponseEntity.ok(report);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody Map<String, Object> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.generateReport(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok(Map.of("message", "Report deleted"));
    }

    @PutMapping("/{id}/fix")
    public ResponseEntity<?> toggleFixed(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        String fixedBy = body != null && body.get("fixedBy") != null ? String.valueOf(body.get("fixedBy")) : "Admin";
        ReportDTO updated = reportService.toggleFixed(id, fixedBy);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Report not found"));
        }
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        ReportDTO report = reportService.getReport(id);
        if (report == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new byte[0]);
        }
        byte[] content = reportService.downloadReport(id, report.getFormat());
        String filename = reportService.getDownloadFilename(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }
}
