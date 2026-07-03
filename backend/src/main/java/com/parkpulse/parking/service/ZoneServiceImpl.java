package com.parkpulse.parking.service;

import com.parkpulse.parking.model.ParkingSlot;
import com.parkpulse.parking.model.Zone;
import com.parkpulse.parking.repository.ParkingSlotRepository;
import com.parkpulse.parking.repository.ZoneRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ZoneServiceImpl implements ZoneService {

    private static final Logger log = LoggerFactory.getLogger(ZoneServiceImpl.class);

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @PostConstruct
    public void init() {
        // No default zones — admin must create zones via Settings > Parking Slots
    }

    @Override
    public List<Zone> getAllZones() {
        return zoneRepository.findAll();
    }

    @Override
    @Transactional
    public void saveZone(Zone zone) {
        zoneRepository.save(zone);
        syncSlotsForZone(zone);
    }

    @Override
    @Transactional
    public void deleteZone(String id) {
        zoneRepository.findById(id).ifPresent(zone -> {
            // Remove all slots for this zone prefix
            List<ParkingSlot> zoneSlots = parkingSlotRepository.findByPrefix(zone.getPrefix());
            parkingSlotRepository.deleteAll(zoneSlots);
            zoneRepository.deleteById(id);
        });
    }

    @Override
    public Optional<Zone> getZoneById(String id) {
        return zoneRepository.findById(id);
    }

    @Override
    public Zone getZoneByPrefix(String prefix) {
        return zoneRepository.findAll().stream()
                .filter(z -> prefix.equals(z.getPrefix()))
                .findFirst()
                .orElse(null);
    }

    private void syncSlotsForZone(Zone zone) {
        String prefix = zone.getPrefix();
        int targetCount = zone.getTotalSlots();

        // Get existing slots for this prefix
        List<ParkingSlot> existing = parkingSlotRepository.findByPrefix(prefix);
        int existingCount = existing.size();

        // Add missing slots
        if (existingCount < targetCount) {
            List<ParkingSlot> toAdd = new ArrayList<>();
            for (int i = existingCount + 1; i <= targetCount; i++) {
                toAdd.add(new ParkingSlot(prefix + i, false, false, false, "", null, null, null, null, ""));
            }
            parkingSlotRepository.saveAll(toAdd);
        }

        // Remove excess slots (only if they are not occupied)
        if (existingCount > targetCount) {
            List<ParkingSlot> toRemove = new ArrayList<>();
            for (int i = targetCount + 1; i <= existingCount; i++) {
                String slotId = prefix + i;
                parkingSlotRepository.findById(slotId).ifPresent(slot -> {
                    if (!slot.isOccupied()) {
                        toRemove.add(slot);
                    }
                });
            }
            if (!toRemove.isEmpty()) {
                parkingSlotRepository.deleteAll(toRemove);
            }
        }
    }
}
