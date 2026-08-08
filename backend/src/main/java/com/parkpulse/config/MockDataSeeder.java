package com.parkpulse.config;

import com.parkpulse.member.model.Member;
import com.parkpulse.member.model.MemberVehicle;
import com.parkpulse.member.model.Plan;
import com.parkpulse.member.service.MemberService;
import com.parkpulse.member.service.PlanService;
import com.parkpulse.parking.model.ParkingSession;
import com.parkpulse.parking.model.ParkingSlot;
import com.parkpulse.parking.model.Zone;
import com.parkpulse.parking.repository.ParkingSessionRepository;
import com.parkpulse.parking.repository.ParkingSlotRepository;
import com.parkpulse.parking.service.ZoneService;
import com.parkpulse.reservation.model.Reservation;
import com.parkpulse.reservation.model.ReservationStatus;
import com.parkpulse.reservation.repository.ReservationRepository;
import com.parkpulse.staff.model.Staff;
import com.parkpulse.staff.service.StaffService;
import com.parkpulse.ticket.dto.TicketDTO;
import com.parkpulse.ticket.model.TicketStatus;
import com.parkpulse.ticket.model.VehicleType;
import com.parkpulse.ticket.service.TicketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;

/**
 * Seeds realistic mock data into every empty backend table so the frontend
 * renders live data. Idempotent: runs only when the plans table is empty.
 */
@Component
public class MockDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MockDataSeeder.class);

    private static final DateTimeFormatter JOIN_DATE = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);

    private static final String[] MEMBER_FIRST = {
            "Aarav", "Mei", "Omar", "Priya", "Liam", "Sofia", "Ethan", "Amara", "Noah", "Zara",
            "Hiro", "Leila", "Mateo", "Aisha", "Jonas", "Yuki", "Diego", "Fatima", "Leo", "Ingrid",
            "Ravi", "Nina", "Oscar", "Hana", "Igor", "Elena", "Tariq", "Maya", "Felix", "Nadia"
    };
    private static final String[] MEMBER_LAST = {
            "Patel", "Chen", "Khan", "Sharma", "Murphy", "Garcia", "Wright", "Hassan", "Brown", "Ali",
            "Tanaka", "Mensah", "Rivera", "Osei", "Berg", "Sato", "Torres", "Hussain", "Novak", "Lund",
            "Reddy", "Park", "Weber", "Kobayashi", "Petrov", "Volkov", "Rahman", "Silva", "Costa", "Jansen"
    };

    private static final String[] STAFF_ROLES = {
            "Facility Manager", "Operations Lead", "Shift Supervisor", "Security Guard",
            "Valet Attendant", "Maintenance Tech", "Support Analyst", "Billing Officer",
            "Gate Operator", "EV Charging Specialist", "Customer Service Rep", "Analytics Analyst",
            "Auditor", "Cleanup Crew Lead", "Dispatcher"
    };

    private static final String[] VEHICLE_TYPES = {"Sedan", "SUV", "EV", "Motorcycle", "Truck", "Coupe", "Van"};
    private static final String[] VEHICLE_MAKES = {"Toyota", "Honda", "Nissan", "BMW", "Tesla", "Mercedes", "Hyundai", "Ford"};
    private static final String[] VEHICLE_COLORS = {"White", "Black", "Silver", "Blue", "Red", "Gray", "Green"};

    @Autowired
    private PlanService planService;
    @Autowired
    private ZoneService zoneService;
    @Autowired
    private ParkingSlotRepository parkingSlotRepository;
    @Autowired
    private ParkingSessionRepository parkingSessionRepository;
    @Autowired
    private MemberService memberService;
    @Autowired
    private StaffService staffService;
    @Autowired
    private TicketService ticketService;
    @Autowired
    private ReservationRepository reservationRepository;

    private final Random random = new Random(42);

    private final List<String> memberNames = new ArrayList<>();
    private final List<String> staffNames = new ArrayList<>();
    private final List<String> slotIds = new ArrayList<>();

    @Override
    public void run(String... args) {
        if (!planService.getAllPlans().isEmpty()) {
            repairSlotStates();
            repairMemberVehicles();
            repairZoneRates();
            repairPlanPrices();
            return;
        }
        log.info("Seeding mock data…");
        seedPlans();
        seedZones();
        seedMembers();
        seedStaff();
        seedSlotStates();
        seedSessions();
        seedTickets();
        seedReservations();
        log.info("Mock data seeded: {} slots, {} members, {} staff, {} reservations.",
                slotIds.size(), memberNames.size(), staffNames.size(),
                reservationRepository.findAll().size());
    }

    private void seedPlans() {
        planService.savePlan(new Plan(null, "Basic", "Entry-level plan for occasional parkers",
                1500, 15000, "blue",
                Arrays.asList("1 vehicle", "Standard parking access", "Email support"),
                "1", "active", false));
        planService.savePlan(new Plan(null, "Professional", "Great value for daily commuters",
                3000, 30000, "violet",
                Arrays.asList("3 vehicles", "Priority parking", "Reserved slots", "Email + phone support"),
                "3", "active", true));
        planService.savePlan(new Plan(null, "Premium", "Best for families and frequent drivers",
                5000, 50000, "amber",
                Arrays.asList("Unlimited vehicles", "Premium valet", "Priority reservations", "24/7 concierge"),
                "unlimited", "active", false));
    }

    private void seedZones() {
        saveZone("North Entrance", "A", 10, 150.0, "Sedan,SUV,Coupe",
                "#3b82f6", true, true, 30);
        saveZone("South Wing", "B", 8, 170.0, "Sedan,SUV,Van,Truck",
                "#22c55e", false, true, 45);
        saveZone("EV Charging", "C", 6, 220.0, "EV",
                "#14b8a6", true, false, 0);
        saveZone("West Deck", "D", 8, 160.0, "Sedan,SUV,Motorcycle",
                "#f59e0b", false, true, 30);
        saveZone("East Court", "E", 7, 180.0, "Sedan,Coupe,Van",
                "#8b5cf6", false, false, 0);
        saveZone("Valet Bay", "F", 6, 250.0, "Sedan,SUV,Van,Truck,Accessible",
                "#ec4899", true, true, 60);
    }

    private void saveZone(String name, String prefix, int total, double rate,
                          String vehicleTypes, String color, boolean overflow, boolean autoRelease, int releaseTimeout) {
        Zone zone = new Zone(null, name, prefix, total, 0, rate, "hourly",
                Arrays.asList(vehicleTypes.split(",")), overflow, autoRelease, releaseTimeout, color, "active");
        zoneService.saveZone(zone);
        for (int i = 1; i <= total; i++) {
            slotIds.add(prefix + i);
        }
    }

    private void seedSlotStates() {
        List<ParkingSlot> slots = parkingSlotRepository.findAll();
        applySlotStates(slots);
        parkingSlotRepository.saveAll(slots);
    }

    /**
     * Repairs slot states in place when a previous seed left them degenerate
     * (fewer than 5 occupied and no reserved slots). Leaves every other table
     * untouched so members/staff/tickets/reservations are preserved.
     */
    private void repairSlotStates() {
        List<ParkingSlot> slots = parkingSlotRepository.findAll();
        long occupied = slots.stream().filter(ParkingSlot::isOccupied).count();
        long reserved = slots.stream().filter(ParkingSlot::isReserved).count();
        if (occupied >= 5 || reserved > 0) {
            log.info("Slot states look healthy ({} occupied, {} reserved) — skipping repair.",
                    occupied, reserved);
            return;
        }
        log.info("Repairing slot states in place (was {} occupied, {} reserved)…", occupied, reserved);
        applySlotStates(slots);
        parkingSlotRepository.saveAll(slots);
    }

    /**
     * Backfills per-member vehicle records for members created before the
     * vehicleList feature existed. Idempotent: members with a non-empty
     * vehicleList are left untouched.
     */
    private void repairMemberVehicles() {
        List<Member> members = memberService.getAllMembers();
        int fixed = 0;
        for (Member m : members) {
            if (m.getVehicleList() != null && !m.getVehicleList().isEmpty()) continue;
            int vehicleCount = 1 + random.nextInt(3);
            List<MemberVehicle> vehicles = new ArrayList<>();
            for (int v = 0; v < vehicleCount; v++) {
                String plate = "LD-" + (1000 + random.nextInt(9000));
                MemberVehicle mv = new MemberVehicle(
                        plate,
                        VEHICLE_TYPES[random.nextInt(VEHICLE_TYPES.length)],
                        VEHICLE_MAKES[random.nextInt(VEHICLE_MAKES.length)],
                        VEHICLE_COLORS[random.nextInt(VEHICLE_COLORS.length)]
                );
                mv.setMember(m);
                vehicles.add(mv);
            }
            m.setVehicleList(vehicles);
            m.setVehicles(vehicles.size());
            memberService.updateMember(m.getId(), m);
            fixed++;
        }
        if (fixed > 0) {
            log.info("Backfilled vehicles for {} members.", fixed);
        }
    }

    private void repairZoneRates() {
        List<Zone> zones = zoneService.getAllZones();
        int updated = 0;
        for (Zone zone : zones) {
            double oldRate = oldRateFor(zone.getPrefix());
            double newRate = newRateFor(zone.getPrefix());
            if (oldRate > 0 && newRate != oldRate && zone.getRatePerHour() == oldRate) {
                zone.setRatePerHour(newRate);
                zoneService.saveZone(zone);
                updated++;
            }
        }
        if (updated > 0) {
            log.info("Updated parking rates to LKR for {} zones.", updated);
        }
    }

    private void repairPlanPrices() {
        List<Plan> plans = planService.getAllPlans();
        int updated = 0;
        for (Plan plan : plans) {
            double[] prices = oldPlanPrices(plan.getName());
            double[] newPrices = newPlanPrices(plan.getName());
            if (prices != null && plan.getMonthlyPrice() == prices[0] && plan.getAnnualPrice() == prices[1]) {
                plan.setMonthlyPrice(newPrices[0]);
                plan.setAnnualPrice(newPrices[1]);
                planService.savePlan(plan);
                updated++;
            }
        }
        if (updated > 0) {
            log.info("Updated membership plan prices to LKR for {} plans.", updated);
        }
    }

    private double oldRateFor(String prefix) {
        switch (prefix == null ? "" : prefix) {
            case "A": return 10.0;
            case "B": return 12.0;
            case "C": return 15.0;
            case "D": return 11.0;
            case "E": return 13.0;
            case "F": return 18.0;
            default:  return -1.0;
        }
    }

    private double newRateFor(String prefix) {
        switch (prefix == null ? "" : prefix) {
            case "A": return 150.0;
            case "B": return 170.0;
            case "C": return 220.0;
            case "D": return 160.0;
            case "E": return 180.0;
            case "F": return 250.0;
            default:  return -1.0;
        }
    }

    private double[] oldPlanPrices(String name) {
        switch (name == null ? "" : name) {
            case "Basic":        return new double[]{9.99, 99.99};
            case "Professional": return new double[]{19.99, 199.99};
            case "Premium":      return new double[]{29.99, 299.99};
            default:             return null;
        }
    }

    private double[] newPlanPrices(String name) {
        switch (name == null ? "" : name) {
            case "Basic":        return new double[]{1500, 15000};
            case "Professional": return new double[]{3000, 30000};
            case "Premium":      return new double[]{5000, 50000};
            default:             return new double[]{-1, -1};
        }
    }

    private void applySlotStates(List<ParkingSlot> slots) {
        // Reset every slot to a clean available state first.
        for (ParkingSlot s : slots) {
            s.setOccupied(false);
            s.setReserved(false);
            s.setMaintenance(false);
            s.setMaintenanceNotes(null);
            s.setVehicle("");
            s.setVehicleType(null);
            s.setOwnerName(null);
            s.setPhone(null);
            s.setNotes(null);
            s.setEntryTime("");
        }

        int occupiedCount = (int) Math.round(slots.size() * 0.40);
        int reservedCount = (int) Math.round(slots.size() * 0.12);
        int maintenanceCount = 2;

        // Shuffle the full index pool once, then assign the first N indices per state.
        List<Integer> pool = new ArrayList<>();
        for (int i = 0; i < slots.size(); i++) pool.add(i);
        java.util.Collections.shuffle(pool, random);

        int k = 0;
        for (int i = 0; i < occupiedCount; i++, k++) {
            ParkingSlot s = slots.get(pool.get(k));
            s.setOccupied(true);
            s.setVehicle(plateFor(s.getId(), i));
            s.setVehicleType(vehicleTypeFor(s.getId()));
            s.setOwnerName(pickMemberName(i));
            s.setPhone("+94 77 " + (1000 + i));
            s.setNotes("");
            s.setEntryTime(LocalDateTime.now().minusMinutes(random.nextInt(300)).toString());
        }
        for (int i = 0; i < reservedCount; i++, k++) {
            ParkingSlot s = slots.get(pool.get(k));
            s.setReserved(true);
            s.setVehicle("");
            s.setEntryTime("");
        }
        for (int i = 0; i < maintenanceCount && k < pool.size(); i++, k++) {
            ParkingSlot s = slots.get(pool.get(k));
            s.setMaintenance(true);
            s.setMaintenanceNotes("Elevator service in progress");
        }
    }

    private String plateFor(String slotId, int seed) {
        String letters = slotId.replaceAll("\\d", "");
        return letters + "-" + String.format("%04d", (seed * 7 + 1) % 10000);
    }

    private String vehicleTypeFor(String slotId) {
        switch (slotId.substring(0, 1)) {
            case "C": return "EV";
            case "F": return Arrays.asList("Sedan", "SUV", "Van", "Truck").get(random.nextInt(4));
            case "B": return Arrays.asList("Sedan", "SUV", "Van", "Truck").get(random.nextInt(4));
            default:  return Arrays.asList("Sedan", "SUV", "Coupe", "Van").get(random.nextInt(4));
        }
    }

    private void seedSessions() {
        List<ParkingSession> sessions = new ArrayList<>();
        List<ParkingSlot> slots = parkingSlotRepository.findAll();

        // Ongoing sessions for currently occupied slots
        for (ParkingSlot slot : slots) {
            if (slot.isOccupied() && slot.getEntryTime() != null && !slot.getEntryTime().isEmpty()) {
                sessions.add(new ParkingSession(UUID.randomUUID().toString(), slot.getId(),
                        slot.getVehicle(), slot.getEntryTime(), ""));
            }
        }

        // Historical sessions spread across the last 7 days (~150 total)
        int target = 150;
        while (sessions.size() < target) {
            LocalDateTime entry = LocalDateTime.now()
                    .minusDays(random.nextInt(7))
                    .withHour(peakHour())
                    .withMinute(random.nextInt(60))
                    .withSecond(random.nextInt(60)).withNano(0);
            if (entry.isAfter(LocalDateTime.now())) entry = entry.minusDays(1);
            LocalDateTime exit = entry.plusHours(1 + random.nextInt(6));
            ParkingSlot slot = slots.get(random.nextInt(slots.size()));
            sessions.add(new ParkingSession(UUID.randomUUID().toString(), slot.getId(),
                    plateFor(slot.getId(), random.nextInt(900)), entry.toString(), exit.toString()));
        }
        parkingSessionRepository.saveAll(sessions);
    }

    private int peakHour() {
        return random.nextBoolean() ? 7 + random.nextInt(3) : 17 + random.nextInt(3);
    }

    private void seedMembers() {
        String[] plans = {"Basic", "Professional", "Premium"};
        String[] statuses = {"active", "active", "active", "active", "pending", "suspended", "inactive"};
        for (int i = 0; i < 30; i++) {
            Member m = new Member();
            m.setName(MEMBER_FIRST[i] + " " + MEMBER_LAST[i]);
            m.setEmail(MEMBER_FIRST[i].toLowerCase() + "." + MEMBER_LAST[i].toLowerCase() + "@parkpulse.io");
            m.setUsername("member" + (i + 1));
            m.setPhone("+94 77 " + (2000 + i));
            m.setPassword("member123");
            m.setPlan(plans[i % plans.length]);
            m.setStatus(statuses[i % statuses.length]);
            m.setJoinedDate(LocalDateTime.now().minusDays(random.nextInt(360))
                    .format(JOIN_DATE));
            int vehicleCount = 1 + random.nextInt(3);
            List<MemberVehicle> vehicles = new ArrayList<>();
            for (int v = 0; v < vehicleCount; v++) {
                String plate = "LD-" + (1000 + i * 10 + v);
                MemberVehicle mv = new MemberVehicle(
                        plate,
                        VEHICLE_TYPES[random.nextInt(VEHICLE_TYPES.length)],
                        VEHICLE_MAKES[random.nextInt(VEHICLE_MAKES.length)],
                        VEHICLE_COLORS[random.nextInt(VEHICLE_COLORS.length)]
                );
                mv.setMember(m);
                vehicles.add(mv);
            }
            m.setVehicles(vehicles.size());
            m.setVehicleList(vehicles);
            m.setBillingCycle(i % 4 == 0 ? "ANNUAL" : "MONTHLY");
            memberService.saveMember(m);
            memberNames.add(m.getName());
        }
    }

    private void seedStaff() {
        String[] accessLevels = {"admin", "manager", "operator", "operator", "viewer", "custom"};
        for (int i = 0; i < 15; i++) {
            Staff s = new Staff();
            s.setId("st-" + (i + 1));
            s.setName(MEMBER_FIRST[(i * 2) % 30] + " " + MEMBER_LAST[(i * 3 + 7) % 30]);
            s.setRole(STAFF_ROLES[i]);
            s.setEmail("staff" + (i + 1) + "@parkpulse.io");
            s.setUsername("staff" + (i + 1));
            s.setPassword("staff123");
            String access = accessLevels[i % accessLevels.length];
            s.setAccess(access);
            s.setActive(i != 3);
            s.setCustomPermissions(customPermissionsFor(access));
            s.setAvatar("");
            s.setPhone("+94 77 " + (3000 + i));
            s.setJoinDate(LocalDateTime.now().minusDays(random.nextInt(500)).format(JOIN_DATE));
            s.setAddress("42 Park Rd, Colombo " + (i + 1));
            s.setVehicleNumber(i % 3 == 0 ? "STF-" + String.format("%04d", i + 1) : "");
            s.setVehicleType(i % 3 == 0 ? "Sedan" : "");
            s.setShift(i % 2 == 0 ? "Day" : "Night");
            s.setStatus(i == 3 ? "Inactive" : "Active");
            staffService.saveStaff(s);
            staffNames.add(s.getName());
        }
    }

    private List<String> customPermissionsFor(String access) {
        switch (access) {
            case "admin":
                return List.of();
            case "manager":
                return List.of();
            case "operator":
                return List.of();
            case "viewer":
                return List.of();
            default:
                return Arrays.asList("dashboard", "analytics", "reports-staff", "tickets", "parking-slots");
        }
    }

    private void seedTickets() {
        List<ParkingSlot> slots = parkingSlotRepository.findAll();
        List<TicketDTO> tickets = new ArrayList<>();

        int ongoingMade = 0;
        for (ParkingSlot slot : slots) {
            if (slot.isOccupied() && ongoingMade < 15) {
                TicketDTO dto = new TicketDTO();
                dto.setVehiclePlate(slot.getVehicle());
                dto.setOwnerName(slot.getOwnerName());
                dto.setSlot(slot.getId());
                dto.setEntryTime(LocalDateTime.parse(slot.getEntryTime()));
                dto.setVehicleType(VehicleType.fromString(slot.getVehicleType()));
                dto.setStatus(TicketStatus.ONGOING);
                dto.setRatePerHour(rateFor(slot.getId()));
                tickets.add(dto);
                ongoingMade++;
            }
        }

        String[] paymentMethods = {"Card", "Cash", "UPI", "Mobile Wallet"};
        for (int i = 0; i < 45; i++) {
            ParkingSlot slot = slots.get(random.nextInt(slots.size()));
            LocalDateTime entry = LocalDateTime.now()
                    .minusDays(random.nextInt(7))
                    .withHour(peakHour())
                    .withMinute(random.nextInt(60)).withSecond(0).withNano(0);
            LocalDateTime exit = entry.plusHours(1 + random.nextInt(6));
            double rate = rateFor(slot.getId());
            long mins = Duration.between(entry, exit).toMinutes();
            double hours = Math.max(1, Math.ceil(mins / 60.0));
            TicketDTO dto = new TicketDTO();
            dto.setVehiclePlate(plateFor(slot.getId(), i + 40));
            dto.setOwnerName(pickMemberName(i));
            dto.setSlot(slot.getId());
            dto.setEntryTime(entry);
            dto.setExitTime(exit);
            dto.setVehicleType(VehicleType.fromString(vehicleTypeFor(slot.getId())));
            dto.setStatus(TicketStatus.FINISHED);
            dto.setAmount(hours * rate);
            dto.setPaymentMethod(paymentMethods[i % paymentMethods.length]);
            dto.setRatePerHour(rate);
            tickets.add(dto);
        }

        for (TicketDTO dto : tickets) {
            ticketService.createTicket(dto);
        }
    }

    private void seedReservations() {
        List<String> types = new ArrayList<>(List.of(
                "RESERVED", "RESERVED", "RESERVED", "RESERVED", "RESERVED",
                "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE",
                "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED",
                "COMPLETED", "COMPLETED",
                "CANCELLED", "CANCELLED", "CANCELLED", "CANCELLED",
                "RESERVED", "ACTIVE", "COMPLETED"));
        for (int i = 0; i < types.size(); i++) {
            Reservation r = new Reservation();
            r.setId(UUID.randomUUID().toString());
            r.setSlotId(slotIds.get(i % slotIds.size()));
            boolean isStaff = i % 3 == 0;
            r.setReservedFor(isStaff ? staffNames.get(i % staffNames.size()) : memberNames.get(i % memberNames.size()));
            r.setReservedForType(isStaff ? "staff" : "member");
            r.setReservedForEmail("person" + (i + 1) + "@parkpulse.io");
            ReservationStatus status = ReservationStatus.fromString(types.get(i));
            r.setStatus(status);
            r.setReservedAt(LocalDateTime.now().minusDays(random.nextInt(6)).toString());

            if (status == ReservationStatus.ACTIVE) {
                r.setPlate(plateFor(r.getSlotId(), i + 20));
                r.setVehicleType(vehicleTypeFor(r.getSlotId()));
                r.setOwnerName(r.getReservedFor());
                r.setEntryTime(LocalDateTime.now().minusHours(1 + random.nextInt(4)).toString());
            } else if (status == ReservationStatus.COMPLETED) {
                LocalDateTime entry = LocalDateTime.now().minusDays(random.nextInt(6)).withHour(9 + random.nextInt(8)).withMinute(0).withSecond(0).withNano(0);
                r.setPlate(plateFor(r.getSlotId(), i + 30));
                r.setVehicleType(vehicleTypeFor(r.getSlotId()));
                r.setOwnerName(r.getReservedFor());
                r.setEntryTime(entry.toString());
                r.setExitTime(entry.plusHours(1 + random.nextInt(5)).toString());
            } else if (status == ReservationStatus.CANCELLED) {
                r.setEntryTime(LocalDateTime.now().minusDays(random.nextInt(4)).toString());
                r.setExitTime(LocalDateTime.now().minusDays(random.nextInt(4)).toString());
            }
            reservationRepository.save(r);
        }
    }

    private double rateFor(String slotId) {
        switch (slotId.substring(0, 1)) {
            case "A": return 150.0;
            case "B": return 170.0;
            case "C": return 220.0;
            case "D": return 160.0;
            case "E": return 180.0;
            case "F": return 250.0;
            default:  return 150.0;
        }
    }

    private String pickMemberName(int seed) {
        return memberNames.isEmpty()
                ? "Seeded Driver"
                : memberNames.get(seed % memberNames.size());
    }
}
