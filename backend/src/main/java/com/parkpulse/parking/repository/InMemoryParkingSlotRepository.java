package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.ParkingSlot;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class InMemoryParkingSlotRepository implements ParkingSlotRepository {

    private final List<ParkingSlot> inMemorySlots = new ArrayList<>();

    @Override
    public List<ParkingSlot> findAll() {
        return new ArrayList<>(inMemorySlots);
    }

    @Override
    public Optional<ParkingSlot> findById(String id) {
        return inMemorySlots.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst();
    }

    @Override
    public ParkingSlot save(ParkingSlot slot) {
        Optional<ParkingSlot> existing = findById(slot.getId());
        if (existing.isPresent()) {
            ParkingSlot s = existing.get();
            s.setOccupied(slot.isOccupied());
            s.setVehicle(slot.getVehicle());
            s.setEntryTime(slot.getEntryTime());
            return s;
        } else {
            inMemorySlots.add(slot);
            return slot;
        }
    }

    @Override
    public void saveAll(List<ParkingSlot> slots) {
        for (ParkingSlot s : slots) {
            save(s);
        }
    }

    @Override
    public List<ParkingSlot> findByPrefix(String prefix) {
        return inMemorySlots.stream()
                .filter(s -> s.getId() != null && s.getId().matches(prefix + "\\d+"))
                .toList();
    }

    @Override
    public void deleteAll(List<ParkingSlot> slots) {
        inMemorySlots.removeAll(slots);
    }
}
