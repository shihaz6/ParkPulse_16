package com.parkpulse.ticket.model;

public enum TicketStatus {
    ONGOING,
    FINISHED;

    public static TicketStatus fromString(String status) {
        if (status == null) return null;
        try {
            return TicketStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            if ("finished".equalsIgnoreCase(status)) return FINISHED;
            return ONGOING;
        }
    }
}
