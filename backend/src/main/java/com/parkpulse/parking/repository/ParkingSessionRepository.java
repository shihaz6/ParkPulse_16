package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.ParkingSession;
import java.util.List;

public interface ParkingSessionRepository {
    List<ParkingSession> findAll();
    void append(ParkingSession session);
    void saveAll(List<ParkingSession> sessions);
}
