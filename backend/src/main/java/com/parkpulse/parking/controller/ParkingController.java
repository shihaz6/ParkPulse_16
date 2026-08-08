package com.parkpulse.parking.controller;

import com.parkpulse.parking.model.ParkingSlot;
import com.parkpulse.parking.service.ParkingService;
import com.parkpulse.ticket.dto.TicketDTO;
import com.parkpulse.ticket.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    @Autowired
    private ParkingService parkingService;

    @Autowired
    private TicketService ticketService;

    @GetMapping("/slots")
    @PreAuthorize("hasAnyAuthority('parking-slots', 'member', '*')")
    public List<ParkingSlot> getSlots() {
        return parkingService.getAllSlots();
    }

    @GetMapping("/slots/available")
    @PreAuthorize("isAuthenticated()")
    public List<ParkingSlot> getAvailableSlots() {
        return parkingService.getAvailableSlots();
    }

    @PostMapping("/slots/checkout/{id}")
    @PreAuthorize("hasAnyAuthority('parking-slots', 'tickets', '*')")
    public ResponseEntity<?> checkoutSlot(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String paymentMethod = body != null ? body.get("paymentMethod") : "cash";
            double ratePerHour = parkingService.getRatePerHourForSlot(id);

            // Read slot data before releasing it
            Optional<ParkingSlot> beforeOpt = parkingService.getSlotById(id);
            if (beforeOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            ParkingSlot before = beforeOpt.get();

            // Check for existing ONGOING ticket for this slot
            Optional<TicketDTO> ongoingTicket = ticketService.findOngoingTicketBySlot(id);

            // Release the slot
            Map<String, String> toggleBody = new HashMap<>();
            ParkingSlot slot = parkingService.toggleSlot(id, toggleBody);

            if (slot == null) {
                return ResponseEntity.notFound().build();
            }

            TicketDTO ticket;
            if (ongoingTicket.isPresent()) {
                ticket = ticketService.checkout(ongoingTicket.get().getId(), paymentMethod, ratePerHour);
            } else {
                // Fallback: create a new FINISHED ticket (no ONGOING ticket existed)
                LocalDateTime entryTime = parseEntryTime(before.getEntryTime());
                ticket = ticketService.createFromParkingSlot(
                        before.getVehicle(),
                        before.getOwnerName(),
                        id,
                        before.getVehicleType(),
                        entryTime,
                        paymentMethod,
                        ratePerHour
                );
            }

            Map<String, Object> result = new HashMap<>();
            result.put("slot", slot);
            result.put("ticket", ticket);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Checkout failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/slots/toggle/{id}")
    public ResponseEntity<?> toggleSlot(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        try {
            boolean isParking = body != null && body.containsKey("vehicle")
                    && body.get("vehicle") != null && !body.get("vehicle").trim().isEmpty();

            ParkingSlot slot = parkingService.toggleSlot(id, body);
            if (slot != null) {
                // If a vehicle was parked, create an ONGOING ticket with the zone's rate
                if (isParking && slot.isOccupied()) {
                    LocalDateTime entryTime = parseEntryTime(slot.getEntryTime());
                    double ratePerHour = parkingService.getRatePerHourForSlot(id);
                    try {
                        ticketService.createOngoingFromParking(
                                slot.getVehicle(),
                                slot.getOwnerName(),
                                slot.getId(),
                                slot.getVehicleType(),
                                entryTime,
                                ratePerHour
                        );
                    } catch (Exception e) {
                        // Log but don't fail the toggle if ticket creation fails
                    }
                }
                return ResponseEntity.ok(slot);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    private LocalDateTime parseEntryTime(String entryTimeStr) {
        if (entryTimeStr == null || entryTimeStr.isEmpty()) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(entryTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(entryTimeStr);
            } catch (Exception e2) {
                return LocalDateTime.now();
            }
        }
    }

    @PostMapping("/slots/{id}/reserve")
    public ResponseEntity<ParkingSlot> reserveSlot(@PathVariable String id) {
        ParkingSlot slot = parkingService.reserveSlot(id);
        if (slot != null) {
            return ResponseEntity.ok(slot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/slots/{id}/release-reservation")
    public ResponseEntity<ParkingSlot> releaseSlotReservation(@PathVariable String id) {
        ParkingSlot slot = parkingService.releaseSlotReservation(id);
        if (slot != null) {
            return ResponseEntity.ok(slot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/slots/{id}/maintenance")
    public ResponseEntity<ParkingSlot> setMaintenance(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        ParkingSlot slot = parkingService.setMaintenance(id, notes);
        if (slot != null) {
            return ResponseEntity.ok(slot);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/slots/{id}/clear-maintenance")
    public ResponseEntity<ParkingSlot> clearMaintenance(@PathVariable String id) {
        ParkingSlot slot = parkingService.clearMaintenance(id);
        if (slot != null) {
            return ResponseEntity.ok(slot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions() {
        return ResponseEntity.ok(parkingService.getAllSessions());
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<?> getPeakHours() {
        return ResponseEntity.ok(parkingService.getPeakHours());
    }
}
