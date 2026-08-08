package com.parkpulse.reservation.repository;

import com.parkpulse.reservation.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataReservationRepository extends JpaRepository<Reservation, String> {
}
