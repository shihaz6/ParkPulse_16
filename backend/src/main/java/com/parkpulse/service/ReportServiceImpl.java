package com.parkpulse.service;

import com.parkpulse.dto.ReportDTO;
import com.parkpulse.dto.ReportStatsDTO;
import com.parkpulse.member.model.Member;
import com.parkpulse.member.service.MemberService;
import com.parkpulse.parking.model.ParkingSession;
import com.parkpulse.parking.model.ParkingSlot;
import com.parkpulse.parking.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ReportServiceImpl implements ReportService {

    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    @Autowired
    private ParkingService parkingService;

    @Autowired
    private MemberService memberService;

    private final AtomicLong idSequence = new AtomicLong();
    private final Map<Long, ReportDTO> reports = new ConcurrentHashMap<>();

    public ReportServiceImpl() {
        seedDemoReports();
    }

    private void seedDemoReports() {
        LocalDateTime now = LocalDateTime.now();
        add("June Occupancy Report", "Occupancy", "PDF",
                "Jun 1, 2026 - Jun 30, 2026", now.minusDays(2), "ready", 284, "Admin", false, "Monthly occupancy and utilisation across all zones.");
        add("Q2 Revenue Summary", "Revenue", "Excel",
                "Apr 1, 2026 - Jun 30, 2026", now.minusDays(5), "ready", 612, "Admin", false, "Revenue breakdown for Q2 including ticket and membership income.");
        add("Member Activity - May", "Member Activity", "CSV",
                "May 1, 2026 - May 31, 2026", now.minusDays(9), "ready", 148, "Admin", true, now.minusDays(9).plusHours(3), "Admin", "Check-in activity for all active members during May.");
        add("Tickets - Last 30 Days", "Tickets", "PDF",
                "Jul 1, 2026 - Jul 31, 2026", now.minusDays(1), "generating", 0, "Admin", false, "Live ticket summary for the last 30 days.");
        add("Vehicle Log Export", "Vehicle Log", "CSV",
                "Jun 1, 2026 - Jun 30, 2026", now.minusDays(12), "failed", 0, "Admin", false, "Full vehicle entry/exit log for June.");
    }

    private ReportDTO add(String name, String type, String format, String dateRange,
                          LocalDateTime generatedAt, String status, int sizeKb, String generatedBy,
                          boolean fixed, String description) {
        return add(name, type, format, dateRange, generatedAt, status, sizeKb, generatedBy, fixed, null, null, description);
    }

    private ReportDTO add(String name, String type, String format, String dateRange,
                          LocalDateTime generatedAt, String status, int sizeKb, String generatedBy,
                          boolean fixed, LocalDateTime fixedAt, String fixedBy, String description) {
        Long id = idSequence.incrementAndGet();
        ReportDTO dto = new ReportDTO(
                id, name, type, format, dateRange,
                generatedAt.format(TIMESTAMP), status, sizeKb, generatedBy,
                fixed, fixedAt != null ? fixedAt.format(TIMESTAMP) : null, fixedBy, description);
        reports.put(id, dto);
        return dto;
    }

    @Override
    public Map<String, Object> getReportSummary() {
        List<ParkingSession> sessions = parkingService.getAllSessions();
        List<ParkingSlot> slots = parkingService.getAllSlots();
        List<Member> members = memberService.getAllMembers();
        Map<String, Object> memberStats = memberService.getMemberStats();

        double hourlyRate = 150.0;
        long occupiedCount = slots.stream().filter(ParkingSlot::isOccupied).count();
        double dailyRevenue = occupiedCount * hourlyRate;

        // Peak Hours Calculation (24 hours)
        int[] peakHours = new int[24];
        for (ParkingSession s : sessions) {
            if (s.getEntryTime() != null && !s.getEntryTime().isEmpty()) {
                try {
                    LocalDateTime dt = LocalDateTime.parse(s.getEntryTime());
                    peakHours[dt.getHour()]++;
                } catch (Exception e) {}
            }
        }

        // Weekly Traffic (Last 7 days)
        Map<String, Integer> weeklyTraffic = new java.util.LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 6; i >= 0; i--) {
            String day = now.minusDays(i).getDayOfWeek().name().substring(0, 3);
            weeklyTraffic.put(day, 0);
        }
        for (ParkingSession s : sessions) {
            try {
                LocalDateTime dt = LocalDateTime.parse(s.getEntryTime());
                if (dt.isAfter(now.minusDays(7))) {
                    String day = dt.getDayOfWeek().name().substring(0, 3);
                    weeklyTraffic.put(day, weeklyTraffic.getOrDefault(day, 0) + 1);
                }
            } catch (Exception e) {}
        }

        // Revenue Breakdown
        double ticketRevenue = sessions.size() * hourlyRate;
        double membershipRevenue = members.size() * 500.0; // Assume flat 500 per member for breakdown simulation

        Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("totalRevenue", ticketRevenue + membershipRevenue);
        summary.put("dailyRevenue", dailyRevenue);
        summary.put("ticketRevenue", ticketRevenue);
        summary.put("membershipRevenue", membershipRevenue);
        summary.put("totalSessions", sessions.size());
        summary.put("totalSlots", slots.size());
        summary.put("totalZones", parkingService.getTotalZonesCount());
        summary.put("activeMembers", memberStats.get("active"));
        summary.put("inactiveMembers", memberStats.get("inactive"));
        summary.put("suspendedMembers", memberStats.get("suspended"));
        summary.put("occupancyRate", (slots.isEmpty() ? 0 : (double) occupiedCount / slots.size() * 100));
        summary.put("peakHours", peakHours);
        summary.put("weeklyTraffic", weeklyTraffic);

        return summary;
    }

    @Override
    public List<ReportDTO> getReports() {
        List<ReportDTO> list = new ArrayList<>(reports.values());
        list.sort(Comparator.comparing(ReportDTO::getGeneratedAt).reversed());
        return list;
    }

    @Override
    public ReportDTO getReport(Long id) {
        return reports.get(id);
    }

    @Override
    public ReportStatsDTO getReportStats() {
        int ready = 0;
        int generating = 0;
        int failed = 0;
        long totalSizeKb = 0;
        for (ReportDTO r : reports.values()) {
            if ("ready".equals(r.getStatus())) ready++;
            else if ("generating".equals(r.getStatus())) generating++;
            else if ("failed".equals(r.getStatus())) failed++;
            totalSizeKb += r.getSizeKb();
        }
        return new ReportStatsDTO(reports.size(), ready, generating, failed, totalSizeKb);
    }

    @Override
    public ReportDTO generateReport(Map<String, Object> request) {
        String name = (String) request.getOrDefault("name", "Untitled Report");
        String type = (String) request.getOrDefault("type", "Occupancy");
        String format = (String) request.getOrDefault("format", "PDF");
        String dateRange = (String) request.getOrDefault("dateRange", "");
        String generatedBy = (String) request.getOrDefault("generatedBy", "Admin");
        String description = (String) request.getOrDefault("description", "");
        int sizeKb = Math.max(24, name.length() * 3 + (int) (Math.random() * 900));
        return add(name, type, format, dateRange, LocalDateTime.now(), "ready", sizeKb, generatedBy, false, description);
    }

    @Override
    public void deleteReport(Long id) {
        reports.remove(id);
    }

    @Override
    public ReportDTO toggleFixed(Long id, String fixedBy) {
        ReportDTO r = reports.get(id);
        if (r == null) return null;
        r.setFixed(!r.isFixed());
        if (r.isFixed()) {
            r.setFixedAt(LocalDateTime.now().format(TIMESTAMP));
            r.setFixedBy(fixedBy != null ? fixedBy : "Admin");
        } else {
            r.setFixedAt(null);
            r.setFixedBy(null);
        }
        return r;
    }

    @Override
    public byte[] downloadReport(Long id, String format) {
        ReportDTO r = reports.get(id);
        if (r == null) return new byte[0];
        StringBuilder sb = new StringBuilder();
        sb.append("ParkPulse Report\n");
        sb.append("Name: ").append(r.getName()).append("\n");
        sb.append("Type: ").append(r.getType()).append("\n");
        sb.append("Format: ").append(r.getFormat()).append("\n");
        sb.append("Date Range: ").append(r.getDateRange()).append("\n");
        sb.append("Generated At: ").append(r.getGeneratedAt()).append("\n");
        sb.append("Generated By: ").append(r.getGeneratedBy()).append("\n");
        sb.append("Description: ").append(r.getDescription() != null ? r.getDescription() : "").append("\n");
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    @Override
    public String getDownloadFilename(Long id) {
        ReportDTO r = reports.get(id);
        if (r == null) return "report.txt";
        String ext = "csv".equalsIgnoreCase(r.getFormat()) ? "csv"
                : "excel".equalsIgnoreCase(r.getFormat()) ? "xls"
                : "pdf";
        return "report_" + id + "." + ext;
    }
}
