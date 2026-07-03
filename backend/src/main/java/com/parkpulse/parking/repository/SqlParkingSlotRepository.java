package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.ParkingSlot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class SqlParkingSlotRepository implements ParkingSlotRepository {

    @Autowired
    private SpringDataParkingSlotRepository springDataParkingSlotRepository;

    @Override
    public List<ParkingSlot> findAll() {
        return springDataParkingSlotRepository.findAll();
    }

    @Override
    public Optional<ParkingSlot> findById(String id) {
        return springDataParkingSlotRepository.findById(id);
    }

    @Override
    public ParkingSlot save(ParkingSlot slot) {
        return springDataParkingSlotRepository.save(slot);
    }

    @Override
    public void saveAll(List<ParkingSlot> slots) {
        springDataParkingSlotRepository.saveAll(slots);
    }

    @Override
    public List<ParkingSlot> findByPrefix(String prefix) {
        // Match slots whose ID starts with the prefix followed by digits only,
        // avoiding false matches from overlapping prefixes (e.g. "A" matching "AB1").
        return springDataParkingSlotRepository.findByIdStartingWith(prefix).stream()
                .filter(s -> s.getId() != null && s.getId().matches(prefix + "\\d+"))
                .toList();
    }

    @Override
    public void deleteAll(List<ParkingSlot> slots) {
        springDataParkingSlotRepository.deleteAll(slots);
    }
}
