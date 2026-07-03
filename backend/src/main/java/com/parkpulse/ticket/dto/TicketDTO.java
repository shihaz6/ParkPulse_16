package com.parkpulse.ticket.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.parkpulse.ticket.model.TicketStatus;
import com.parkpulse.ticket.model.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class TicketDTO {
    private String id;
    
    @NotBlank(message = "Vehicle plate is required")
    private String vehiclePlate;
    
    @NotBlank(message = "Owner name is required")
    private String ownerName;
    
    @NotBlank(message = "Slot is required")
    private String slot;
    
    @NotNull(message = "Entry time is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime entryTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime exitTime;
    
    private Double amount;
    private TicketStatus status;
    
    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;
    
    private String paymentMethod;
    private Double ratePerHour;
    private Long durationMins;
    private String zone;

    public TicketDTO() {}

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

    public Long getDurationMins() { return durationMins; }
    public void setDurationMins(Long durationMins) { this.durationMins = durationMins; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
}
