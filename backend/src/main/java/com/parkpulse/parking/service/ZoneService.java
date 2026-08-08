package com.parkpulse.parking.service;

import com.parkpulse.parking.model.Zone;
import java.util.List;
import java.util.Optional;

public interface ZoneService {
    List<Zone> getAllZones();
    void saveZone(Zone zone);
    void deleteZone(String id);
    Optional<Zone> getZoneById(String id);
    Zone getZoneByPrefix(String prefix);
}
