package com.parkpulse.service;

import com.parkpulse.member.model.Member;
import com.parkpulse.member.service.MemberService;
import com.parkpulse.parking.model.ParkingSlot;
import com.parkpulse.parking.model.Zone;
import com.parkpulse.parking.service.ParkingService;
import com.parkpulse.parking.service.ZoneService;
import com.parkpulse.report.service.ProblemReportService;
import com.parkpulse.staff.model.Staff;
import com.parkpulse.staff.service.StaffService;
import com.parkpulse.ticket.model.TicketStatus;
import com.parkpulse.ticket.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private AIService aiService;

    @Autowired
    private ParkingService parkingService;

    @Autowired
    private ZoneService zoneService;

    @Autowired
    private MemberService memberService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private ProblemReportService problemReportService;

    @Override
    public String processMessage(String message, String username, String role, String userId) {
        boolean isMember = "MEMBER".equals(role);

        List<ParkingSlot> slots = parkingService.getAllSlots();
        long total = slots.size();
        long occupied = slots.stream().filter(ParkingSlot::isOccupied).count();
        long available = slots.stream().filter(s -> !s.isOccupied() && !s.isReserved() && !s.isMaintenance()).count();
        long maintenance = slots.stream().filter(ParkingSlot::isMaintenance).count();
        long reserved = slots.stream().filter(ParkingSlot::isReserved).count();

        String systemPrompt;
        String contextData;

        if (isMember) {
            Optional<Member> memberOpt = memberService.getMemberById(userId);
            String memberName = memberOpt.map(Member::getName).orElse(username);

            systemPrompt = "You are Parker, an AI assistant for a parking management system. " +
                "The user is a MEMBER named " + memberName + ". " +
                "You ONLY have access to: parking slot availability counts and the member's own subscription details. " +
                "If asked about revenue, tickets, staff, reports, other members, or any other data, politely decline saying it is not available to their account type. " +
                "Be concise and friendly. Answer in 2-4 sentences.\n\n" +
                "CRITICAL - Use these EXACT numbers and never change them:\n" +
                "Total parking slots: " + total + "\n" +
                "Occupied: " + occupied + "\n" +
                "Available: " + available + "\n" +
                "Maintenance: " + maintenance + "\n" +
                "Reserved: " + reserved;

            contextData = buildMemberContext(memberOpt);
        } else {
            systemPrompt = "You are Parker, an AI assistant for a parking management system. " +
                "Answer questions based on the provided data. Be concise and friendly. " +
                "Use the \\u0dbbු symbol as the currency symbol when showing amounts. Answer in 2-4 sentences.\n\n" +
                "CRITICAL - Use these EXACT numbers and never change them:\n" +
                "Total parking slots: " + total + "\n" +
                "Occupied: " + occupied + "\n" +
                "Available: " + available + "\n" +
                "Maintenance: " + maintenance + "\n" +
                "Reserved: " + reserved;

            contextData = buildStaffContext();
        }

        return aiService.askAI(systemPrompt, contextData, message);
    }

    private String buildMemberContext(Optional<Member> memberOpt) {
        StringBuilder sb = new StringBuilder();

        List<ParkingSlot> slots = parkingService.getAllSlots();
        long available = slots.stream().filter(s -> !s.isOccupied() && !s.isReserved() && !s.isMaintenance()).count();
        long occupied = slots.stream().filter(ParkingSlot::isOccupied).count();
        long total = slots.size();

        sb.append("Parking availability: ").append(available)
            .append(" available, ").append(occupied)
            .append(" occupied out of ").append(total)
            .append(" total slots.\n");

        memberOpt.ifPresent(m -> {
            sb.append("Member: ").append(m.getName()).append("\n");
            sb.append("Plan: ").append(m.getPlan())
                .append(" (").append(m.getStatus()).append(", joined ").append(m.getJoinedDate()).append(")\n");
            var sub = memberService.calculateSubscription(m);
            sb.append("Billing: ").append(sub.get("billingCycle"))
                .append(" (next renewal ").append(sub.get("nextRenewalDate"))
                .append(", ").append(sub.get("daysRemaining")).append(" days remaining)");
        });

        return sb.toString();
    }

    private String buildStaffContext() {
        StringBuilder sb = new StringBuilder();

        List<ParkingSlot> slots = parkingService.getAllSlots();
        long total = slots.size();
        long occupied = slots.stream().filter(ParkingSlot::isOccupied).count();
        long available = slots.stream().filter(s -> !s.isOccupied() && !s.isReserved() && !s.isMaintenance()).count();
        long maintenance = slots.stream().filter(ParkingSlot::isMaintenance).count();
        long reserved = slots.stream().filter(ParkingSlot::isReserved).count();

        sb.append("PARKING SLOTS\n");
        sb.append("Total: ").append(total)
            .append(" | Available: ").append(available)
            .append(" | Occupied: ").append(occupied)
            .append(" | Maintenance: ").append(maintenance)
            .append(" | Reserved: ").append(reserved).append("\n\n");

        sb.append("ZONES\n");
        List<Zone> zones = zoneService.getAllZones();
        for (Zone z : zones) {
            sb.append("- ").append(z.getName())
                .append(" (prefix ").append(z.getPrefix()).append("): ")
                .append(z.getTotalSlots()).append(" slots, $")
                .append(String.format("%.2f", z.getRatePerHour())).append("/hr, ")
                .append(z.getStatus()).append("\n");
        }

        sb.append("\nREVENUE\n");
        try {
            Map<String, Object> rs = reportService.getReportSummary();
            sb.append("Daily: $").append(rs.get("dailyRevenue"))
                .append(" | Total: $").append(rs.get("totalRevenue"))
                .append(" | Tickets: $").append(rs.get("ticketRevenue"))
                .append(" | Memberships: $").append(rs.get("membershipRevenue")).append("\n");
            sb.append("Sessions: ").append(rs.get("totalSessions"))
                .append(" | Occupancy: ").append(rs.get("occupancyRate")).append("%");
        } catch (Exception e) {
            sb.append("unavailable");
        }

        sb.append("\n\nTICKETS\n");
        var allTickets = ticketService.getAllTickets(null, null, null, null, null, null, null, null);
        long ongoing = allTickets.stream().filter(t -> t.getStatus() == TicketStatus.ONGOING).count();
        long finished = allTickets.stream().filter(t -> t.getStatus() == TicketStatus.FINISHED).count();
        sb.append("Total: ").append(allTickets.size())
            .append(" | Ongoing: ").append(ongoing)
            .append(" | Finished: ").append(finished);

        sb.append("\n\nMEMBERS\n");
        Map<String, Object> memberStats = memberService.getMemberStats();
        sb.append("Total: ").append(memberStats.get("total"))
            .append(" | Active: ").append(memberStats.get("active"))
            .append(" | Inactive: ").append(memberStats.get("inactive"))
            .append(" | Suspended: ").append(memberStats.get("suspended"));

        sb.append("\n\nSTAFF\n");
        List<Staff> allStaff = staffService.getAllStaff();
        sb.append("Total: ").append(allStaff.size());

        sb.append("\n\nOPEN REPORTS\n");
        try {
            sb.append(problemReportService.getPendingCount());
        } catch (Exception e) {
            sb.append("unavailable");
        }

        return sb.toString();
    }
}
