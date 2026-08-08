package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.Zone;
import java.util.List;
import java.util.Optional;

public interface ZoneRepository {
    List<Zone> findAll();
    Optional<Zone> findById(String id);
    Zone save(Zone zone);
    void deleteById(String id);
    void saveAll(List<Zone> zones);
}
