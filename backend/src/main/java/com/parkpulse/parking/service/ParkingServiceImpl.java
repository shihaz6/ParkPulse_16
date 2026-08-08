package com.parkpulse.parking.service;

import com.parkpulse.parking.model.ParkingSession;
import com.parkpulse.parking.model.ParkingSlot;
import com.parkpulse.parking.model.Zone;
import com.parkpulse.parking.repository.ParkingSessionRepository;
import com.parkpulse.parking.repository.ParkingSlotRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ParkingServiceImpl implements ParkingService {

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private ParkingSessionRepository parkingSessionRepository;

    @Autowired
    private ZoneService zoneService;

    @PostConstruct
    public void init() {
        // No default parking data — all data comes from the database
    }

    @Override
    public List<ParkingSlot> getAllSlots() {
        return parkingSlotRepository.findAll();
    }

    @Override
    public List<ParkingSlot> getAvailableSlots() {
        return parkingSlotRepository.findAll().stream()
            .filter(s -> !s.isOccupied() && !s.isReserved() && !s.isMaintenance())
            .peek(s -> {
                s.setVehicle(null);
                s.setVehicleType(null);
                s.setOwnerName(null);
                s.setPhone(null);
                s.setNotes(null);
                s.setEntryTime(null);
            })
            .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Optional<ParkingSlot> getSlotById(String id) {
        return parkingSlotRepository.findById(id);
    }

    @Override
    public ParkingSlot toggleSlot(String slotId, Map<String, String> body) {
        Optional<ParkingSlot> slotOpt = parkingSlotRepository.findById(slotId);
        
        if (slotOpt.isPresent()) {
            ParkingSlot slot = slotOpt.get();
            boolean newOccupied = !slot.isOccupied();
            
            if (newOccupied) {
                validateVehicleType(slotId, body != null ? body.get("vehicleType") : null);
            }
            
            slot.setOccupied(newOccupied);
            
            if (newOccupied) {
                String vehicle = (body != null && body.get("vehicle") != null && !body.get("vehicle").trim().isEmpty())
                    ? body.get("vehicle").trim()
                    : "";
                slot.setVehicle(vehicle);
                if (body != null) {
                    slot.setVehicleType(body.get("vehicleType"));
                    slot.setOwnerName(body.get("ownerName"));
                    slot.setPhone(body.get("phone"));
                    slot.setNotes(body.get("notes"));
                }
                slot.setEntryTime(LocalDateTime.now().toString());
                // Clear reserved flag if this was a reservation check-in
                if (slot.isReserved()) {
                    slot.setReserved(false);
                }
                // Clear maintenance if slot was in maintenance
                if (slot.isMaintenance()) {
                    slot.setMaintenance(false);
                    slot.setMaintenanceNotes(null);
                }
                
                ParkingSession session = new ParkingSession(
                    UUID.randomUUID().toString(),
                    slot.getId(),
                    slot.getVehicle(),
                    slot.getEntryTime(),
                    ""
                );
                parkingSessionRepository.append(session);
            } else {
                List<ParkingSession> sessions = parkingSessionRepository.findAll();
                for (int i = sessions.size() - 1; i >= 0; i--) {
                    ParkingSession s = sessions.get(i);
                    if (s.getSlotId().equals(slotId) && (s.getExitTime() == null || s.getExitTime().isEmpty())) {
                        s.setExitTime(LocalDateTime.now().toString());
                        parkingSessionRepository.saveAll(sessions);
                        break;
                    }
                }
                slot.setVehicle("");
                slot.setVehicleType(null);
                slot.setOwnerName(null);
                slot.setPhone(null);
                slot.setNotes(null);
                slot.setEntryTime("");
                slot.setReserved(false);
            }

            parkingSlotRepository.save(slot);
            return slot;
        }
        return null;
    }

    @Override
    public ParkingSlot reserveSlot(String slotId) {
        Optional<ParkingSlot> slotOpt = parkingSlotRepository.findById(slotId);
        if (slotOpt.isPresent()) {
            ParkingSlot slot = slotOpt.get();
            if (slot.isOccupied()) return null;
            slot.setReserved(true);
            slot.setVehicle("");
            slot.setEntryTime("");
            parkingSlotRepository.save(slot);
            return slot;
        }
        return null;
    }

    @Override
    public ParkingSlot releaseSlotReservation(String slotId) {
        Optional<ParkingSlot> slotOpt = parkingSlotRepository.findById(slotId);
        if (slotOpt.isPresent()) {
            ParkingSlot slot = slotOpt.get();
            slot.setReserved(false);
            slot.setVehicle("");
            slot.setEntryTime("");
            parkingSlotRepository.save(slot);
            return slot;
        }
        return null;
    }

    @Override
    public ParkingSlot setMaintenance(String slotId, String notes) {
        Optional<ParkingSlot> slotOpt = parkingSlotRepository.findById(slotId);
        if (slotOpt.isPresent()) {
            ParkingSlot slot = slotOpt.get();
            if (slot.isOccupied()) return null;
            slot.setMaintenance(true);
            slot.setMaintenanceNotes(notes != null ? notes : "");
            slot.setVehicle("");
            slot.setEntryTime("");
            slot.setReserved(false);
            parkingSlotRepository.save(slot);
            return slot;
        }
        return null;
    }

    @Override
    public ParkingSlot clearMaintenance(String slotId) {
        Optional<ParkingSlot> slotOpt = parkingSlotRepository.findById(slotId);
        if (slotOpt.isPresent()) {
            ParkingSlot slot = slotOpt.get();
            slot.setMaintenance(false);
            slot.setMaintenanceNotes(null);
            parkingSlotRepository.save(slot);
            return slot;
        }
        return null;
    }

    @Override
    public List<ParkingSession> getAllSessions() {
        return parkingSessionRepository.findAll();
    }

    @Override
    public int[] getPeakHours() {
        int[] hours = new int[24];
        List<ParkingSession> sessions = getAllSessions();
        for (ParkingSession session : sessions) {
            if (session.getEntryTime() != null && !session.getEntryTime().isEmpty()) {
                try {
                    LocalDateTime dt = LocalDateTime.parse(session.getEntryTime());
                    hours[dt.getHour()]++;
                } catch (Exception e) {
                    // Ignore malformed dates
                }
            }
        }
        return hours;
    }

    @Override
    public int getTotalZonesCount() {
        return zoneService.getAllZones().size();
    }

    @Override
    public double getRatePerHourForSlot(String slotId) {
        String prefix = extractPrefix(slotId);
        Zone zone = zoneService.getZoneByPrefix(prefix);
        return zone != null && zone.getRatePerHour() > 0 ? zone.getRatePerHour() : 10.0;
    }

    private String extractPrefix(String slotId) {
        if (slotId == null) return "";
        return slotId.replaceAll("\\d+$", "");
    }

    private void validateVehicleType(String slotId, String vehicleType) {
        if (vehicleType == null || vehicleType.isBlank()) return;
        String prefix = extractPrefix(slotId);
        Zone zone = zoneService.getZoneByPrefix(prefix);
        if (zone != null && zone.getVehicleTypes() != null && !zone.getVehicleTypes().isEmpty()) {
            if (!zone.getVehicleTypes().contains(vehicleType)) {
                throw new IllegalArgumentException(
                    "Vehicle type '" + vehicleType + "' is not allowed in zone '" + zone.getName() + "'. " +
                    "Allowed types: " + String.join(", ", zone.getVehicleTypes())
                );
            }
        }
    }
}
