package com.parkpulse.reservation.service;

import com.parkpulse.reservation.model.Reservation;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ReservationService {
    List<Reservation> getAllReservations();
    Optional<Reservation> getReservationById(String id);
    Reservation createReservation(Map<String, String> body);
    Reservation checkinReservation(String id, Map<String, String> body);
    Reservation completeReservation(String id);
    Reservation cancelReservation(String id);
}
