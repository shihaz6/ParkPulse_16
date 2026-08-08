package com.parkpulse.parking.service;

import com.parkpulse.parking.model.ParkingSession;
import com.parkpulse.parking.model.ParkingSlot;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ParkingService {
    List<ParkingSlot> getAllSlots();
    List<ParkingSlot> getAvailableSlots();
    Optional<ParkingSlot> getSlotById(String id);
    ParkingSlot toggleSlot(String slotId, Map<String, String> body);
    ParkingSlot reserveSlot(String slotId);
    ParkingSlot releaseSlotReservation(String slotId);
    ParkingSlot setMaintenance(String slotId, String notes);
    ParkingSlot clearMaintenance(String slotId);
    List<ParkingSession> getAllSessions();
    int[] getPeakHours();
    int getTotalZonesCount();
    double getRatePerHourForSlot(String slotId);
}
