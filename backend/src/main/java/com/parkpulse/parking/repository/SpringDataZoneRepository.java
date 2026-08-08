package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataZoneRepository extends JpaRepository<Zone, String> {
    @Query("SELECT DISTINCT z FROM Zone z LEFT JOIN FETCH z.vehicleTypes")
    List<Zone> findAllWithVehicleTypes();
}
