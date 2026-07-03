package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.Zone;
import com.parkpulse.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class FileZoneRepository implements ZoneRepository {

    private static final String ZONES_FILE = "zones.txt";

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public List<Zone> findAll() {
        return fileStorageService.loadAll(ZONES_FILE, Zone::fromString).stream()
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Optional<Zone> findById(String id) {
        return findAll().stream()
                .filter(z -> z.getId().equals(id))
                .findFirst();
    }

    @Override
    public Zone save(Zone zone) {
        List<Zone> zones = findAll();
        if (zone.getId() == null || zone.getId().isEmpty()) {
            zone.setId("z" + System.currentTimeMillis());
            zones.add(zone);
        } else {
            boolean found = false;
            for (int i = 0; i < zones.size(); i++) {
                if (zones.get(i).getId().equals(zone.getId())) {
                    zones.set(i, zone);
                    found = true;
                    break;
                }
            }
            if (!found) {
                zones.add(zone);
            }
        }
        fileStorageService.saveAll(ZONES_FILE, zones);
        return zone;
    }

    @Override
    public void deleteById(String id) {
        List<Zone> zones = findAll();
        zones.removeIf(z -> z.getId().equals(id));
        fileStorageService.saveAll(ZONES_FILE, zones);
    }

    @Override
    public void saveAll(List<Zone> zones) {
        fileStorageService.saveAll(ZONES_FILE, zones);
    }
}
