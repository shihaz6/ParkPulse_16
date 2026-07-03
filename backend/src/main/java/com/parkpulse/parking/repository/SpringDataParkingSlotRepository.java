package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpringDataParkingSlotRepository extends JpaRepository<ParkingSlot, String> {
    List<ParkingSlot> findByIdStartingWith(String prefix);
}
