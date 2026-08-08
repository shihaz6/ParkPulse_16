package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.ParkingSlot;
import java.util.List;
import java.util.Optional;

public interface ParkingSlotRepository {
    List<ParkingSlot> findAll();
    Optional<ParkingSlot> findById(String id);
    ParkingSlot save(ParkingSlot slot);
    void saveAll(List<ParkingSlot> slots);
    List<ParkingSlot> findByPrefix(String prefix);
    void deleteAll(List<ParkingSlot> slots);
}
