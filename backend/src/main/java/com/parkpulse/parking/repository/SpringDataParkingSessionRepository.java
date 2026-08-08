package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataParkingSessionRepository extends JpaRepository<ParkingSession, String> {
}
