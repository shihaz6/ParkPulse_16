package com.parkpulse.reservation.controller;

import com.parkpulse.reservation.model.Reservation;
import com.parkpulse.reservation.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reservation> getReservationById(@PathVariable String id) {
        return reservationService.getReservationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Reservation createReservation(@RequestBody Map<String, String> body) {
        return reservationService.createReservation(body);
    }

    @PutMapping("/{id}/checkin")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reservation> checkinReservation(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        return ResponseEntity.ok(reservationService.checkinReservation(id, body));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reservation> completeReservation(@PathVariable String id) {
        return ResponseEntity.ok(reservationService.completeReservation(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable String id) {
        return ResponseEntity.ok(reservationService.cancelReservation(id));
    }
}
