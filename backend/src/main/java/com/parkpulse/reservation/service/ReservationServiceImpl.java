package com.parkpulse.reservation.service;

import com.parkpulse.parking.model.ParkingSlot;
import com.parkpulse.parking.repository.ParkingSlotRepository;
import com.parkpulse.reservation.model.Reservation;
import com.parkpulse.reservation.model.ReservationStatus;
import com.parkpulse.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReservationServiceImpl implements ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Override
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @Override
    public Optional<Reservation> getReservationById(String id) {
        return reservationRepository.findById(id);
    }

    @Override
    @Transactional
    public Reservation createReservation(Map<String, String> body) {
        String slotId = body.get("slotId");
        if (slotId == null || slotId.isBlank()) {
            throw new IllegalArgumentException("slotId is required");
        }

        Optional<ParkingSlot> slotOpt = parkingSlotRepository.findById(slotId);
        if (slotOpt.isEmpty()) {
            throw new IllegalArgumentException("Parking slot not found: " + slotId);
        }
        ParkingSlot slot = slotOpt.get();
        if (slot.isOccupied() || slot.isReserved()) {
            throw new IllegalArgumentException("Slot " + slotId + " is not available for reservation");
        }

        Reservation reservation = new Reservation();
        reservation.setId(UUID.randomUUID().toString());
        reservation.setSlotId(slotId);
        reservation.setReservedFor(body.getOrDefault("reservedFor", ""));
        reservation.setReservedForType(body.getOrDefault("reservedForType", "member"));
        reservation.setReservedForEmail(body.getOrDefault("reservedForEmail", ""));
        reservation.setPlate(body.get("plate"));
        reservation.setVehicleType(body.get("vehicleType"));
        reservation.setStatus(ReservationStatus.RESERVED);
        reservation.setReservedAt(LocalDateTime.now().toString());

        slot.setReserved(true);
        slot.setVehicle("");
        slot.setEntryTime("");
        parkingSlotRepository.save(slot);

        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional
    public Reservation checkinReservation(String id, Map<String, String> body) {
        Reservation reservation = getOrThrow(id);
        if (reservation.getStatus() == ReservationStatus.COMPLETED
                || reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot check in a " + reservation.getStatus().name().toLowerCase() + " reservation");
        }

        reservation.setStatus(ReservationStatus.ACTIVE);
        if (body != null) {
            if (body.get("plate") != null) reservation.setPlate(body.get("plate"));
            if (body.get("vehicleType") != null) reservation.setVehicleType(body.get("vehicleType"));
            if (body.get("ownerName") != null) reservation.setOwnerName(body.get("ownerName"));
        }
        reservation.setEntryTime(LocalDateTime.now().toString());

        parkingSlotRepository.findById(reservation.getSlotId()).ifPresent(slot -> {
            if (slot.isReserved()) {
                slot.setReserved(false);
            }
            if (body != null && body.get("plate") != null) slot.setVehicle(body.get("plate"));
            if (body != null && body.get("ownerName") != null) slot.setOwnerName(body.get("ownerName"));
            parkingSlotRepository.save(slot);
        });

        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional
    public Reservation completeReservation(String id) {
        Reservation reservation = getOrThrow(id);
        if (reservation.getStatus() == ReservationStatus.COMPLETED
                || reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot complete a " + reservation.getStatus().name().toLowerCase() + " reservation");
        }

        reservation.setStatus(ReservationStatus.COMPLETED);
        if (reservation.getExitTime() == null || reservation.getExitTime().isEmpty()) {
            reservation.setExitTime(LocalDateTime.now().toString());
        }

        parkingSlotRepository.findById(reservation.getSlotId()).ifPresent(slot -> {
            slot.setReserved(false);
            slot.setVehicle("");
            slot.setVehicleType(null);
            slot.setOwnerName(null);
            slot.setPhone(null);
            slot.setNotes(null);
            slot.setEntryTime("");
            parkingSlotRepository.save(slot);
        });

        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional
    public Reservation cancelReservation(String id) {
        Reservation reservation = getOrThrow(id);
        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot cancel a completed reservation");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);

        parkingSlotRepository.findById(reservation.getSlotId()).ifPresent(slot -> {
            slot.setReserved(false);
            slot.setVehicle("");
            slot.setEntryTime("");
            parkingSlotRepository.save(slot);
        });

        return reservationRepository.save(reservation);
    }

    private Reservation getOrThrow(String id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));
    }
}
