package com.parkpulse.reservation.model;

public enum ReservationStatus {
    RESERVED,
    ACTIVE,
    COMPLETED,
    CANCELLED;

    public static ReservationStatus fromString(String status) {
        if (status == null) return null;
        try {
            return ReservationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return RESERVED;
        }
    }
}
