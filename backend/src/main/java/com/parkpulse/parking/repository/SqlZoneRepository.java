package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.Zone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class SqlZoneRepository implements ZoneRepository {

    @Autowired
    private SpringDataZoneRepository springDataZoneRepository;

    @Override
    public List<Zone> findAll() {
        return springDataZoneRepository.findAllWithVehicleTypes();
    }

    @Override
    public Optional<Zone> findById(String id) {
        return springDataZoneRepository.findById(id);
    }

    @Override
    public Zone save(Zone zone) {
        return springDataZoneRepository.save(zone);
    }

    @Override
    public void deleteById(String id) {
        springDataZoneRepository.deleteById(id);
    }

    @Override
    public void saveAll(List<Zone> zones) {
        springDataZoneRepository.saveAll(zones);
    }
}
