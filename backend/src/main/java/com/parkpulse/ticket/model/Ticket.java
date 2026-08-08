package com.parkpulse.ticket.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    private String id;
    private String vehiclePlate;
    private String ownerName;
    private String slot;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;
    private String paymentMethod;
    private Double ratePerHour;

    public Ticket() {}

    public Ticket(String id, String vehiclePlate, String ownerName, String slot, LocalDateTime entryTime, LocalDateTime exitTime, Double amount, TicketStatus status, VehicleType vehicleType, String paymentMethod) {
        this(id, vehiclePlate, ownerName, slot, entryTime, exitTime, amount, status, vehicleType, paymentMethod, null);
    }

    public Ticket(String id, String vehiclePlate, String ownerName, String slot, LocalDateTime entryTime, LocalDateTime exitTime, Double amount, TicketStatus status, VehicleType vehicleType, String paymentMethod, Double ratePerHour) {
        this.id = id;
        this.vehiclePlate = vehiclePlate;
        this.ownerName = ownerName;
        this.slot = slot;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
        this.amount = amount;
        this.status = status;
        this.vehicleType = vehicleType;
        this.paymentMethod = paymentMethod;
        this.ratePerHour = ratePerHour;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVehiclePlate() { return vehiclePlate; }
    public void setVehiclePlate(String vehiclePlate) { this.vehiclePlate = vehiclePlate; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public LocalDateTime getEntryTime() { return entryTime; }
    public void setEntryTime(LocalDateTime entryTime) { this.entryTime = entryTime; }

    public LocalDateTime getExitTime() { return exitTime; }
    public void setExitTime(LocalDateTime exitTime) { this.exitTime = exitTime; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Double getRatePerHour() { return ratePerHour; }
    public void setRatePerHour(Double ratePerHour) { this.ratePerHour = ratePerHour; }

    /**
     * Handles payment calculation and state transition.
     */
    public void completePayment(LocalDateTime exitTime, String method) {
        this.exitTime = exitTime != null ? exitTime : LocalDateTime.now();
        this.paymentMethod = method;
        this.status = TicketStatus.FINISHED;

        double rate = ratePerHour != null ? ratePerHour : getDefaultRate();

        if (this.entryTime != null) {
            long minutes = java.time.Duration.between(this.entryTime, exitTime != null ? exitTime : LocalDateTime.now()).toMinutes();
            double hours = Math.ceil(minutes / 60.0);
            if (hours < 1) hours = 1;
            this.amount = hours * rate;
        } else {
            this.amount = rate;
        }
    }

    private double getDefaultRate() {
        if (vehicleType == null) return 10.0;
        switch (vehicleType) {
            case SUV: return 15.0;
            case MOTORCYCLE: return 5.0;
            case TRUCK: return 20.0;
            case VAN: return 12.0;
            default: return 10.0;
        }
    }
}
