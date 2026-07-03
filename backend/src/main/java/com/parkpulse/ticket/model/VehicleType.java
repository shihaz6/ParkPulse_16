package com.parkpulse.ticket.model;

public enum VehicleType {
    CAR,
    SUV,
    MOTORCYCLE,
    TRUCK,
    VAN;

    public static VehicleType fromString(String type) {
        if (type == null) return CAR;
        try {
            return VehicleType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return CAR;
        }
    }
}
