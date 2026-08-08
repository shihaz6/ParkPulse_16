package com.parkpulse.service;

import com.parkpulse.member.model.Member;
import com.parkpulse.parking.model.ParkingSession;
import com.parkpulse.parking.model.ParkingSlot;
import com.parkpulse.parking.service.ParkingService;
import com.parkpulse.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private ParkingService parkingService;

    @Autowired
    private MemberService memberService;

    @Override
    public Map<String, Object> getReportSummary() {
        List<ParkingSession> sessions = parkingService.getAllSessions();
        List<ParkingSlot> slots = parkingService.getAllSlots();
        List<Member> members = memberService.getAllMembers();
        Map<String, Object> memberStats = memberService.getMemberStats();

        double hourlyRate = 10.0;
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
        double membershipRevenue = members.size() * 50.0; // Assume flat 50 per member for breakdown simulation

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
}
