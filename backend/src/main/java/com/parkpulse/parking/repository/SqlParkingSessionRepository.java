package com.parkpulse.parking.repository;

import com.parkpulse.parking.model.ParkingSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Primary
public class SqlParkingSessionRepository implements ParkingSessionRepository {

    @Autowired
    private SpringDataParkingSessionRepository springDataParkingSessionRepository;

    @Override
    public List<ParkingSession> findAll() {
        return springDataParkingSessionRepository.findAll();
    }

    @Override
    public void append(ParkingSession session) {
        springDataParkingSessionRepository.save(session);
    }

    @Override
    public void saveAll(List<ParkingSession> sessions) {
        springDataParkingSessionRepository.saveAll(sessions);
    }
}
