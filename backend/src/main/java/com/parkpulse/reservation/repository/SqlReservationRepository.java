package com.parkpulse.reservation.repository;

import com.parkpulse.reservation.model.Reservation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class SqlReservationRepository implements ReservationRepository {

    @Autowired
    private SpringDataReservationRepository springDataReservationRepository;

    @Override
    public List<Reservation> findAll() {
        return springDataReservationRepository.findAll();
    }

    @Override
    public Optional<Reservation> findById(String id) {
        return springDataReservationRepository.findById(id);
    }

    @Override
    public Reservation save(Reservation reservation) {
        return springDataReservationRepository.save(reservation);
    }

    @Override
    public void deleteById(String id) {
        springDataReservationRepository.deleteById(id);
    }

    @Override
    public void deleteAll() {
        springDataReservationRepository.deleteAll();
    }
}
