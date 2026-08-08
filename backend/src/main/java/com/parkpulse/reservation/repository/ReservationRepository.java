package com.parkpulse.reservation.repository;

import com.parkpulse.reservation.model.Reservation;
import java.util.List;
import java.util.Optional;

/**
 * Abstraction for Reservation data access.
 */
public interface ReservationRepository {
    List<Reservation> findAll();
    Optional<Reservation> findById(String id);
    Reservation save(Reservation reservation);
    void deleteById(String id);
    void deleteAll();
}
