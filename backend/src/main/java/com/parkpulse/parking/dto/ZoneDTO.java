package com.parkpulse.parking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class ZoneDTO {
    private String id;
    
    @NotBlank(message = "Zone name is required")
    private String name;
    
    @NotBlank(message = "Prefix is required")
    private String prefix;
    
    @Min(value = 1, message = "Total slots must be at least 1")
    private int totalSlots;
    
    @Min(value = 0, message = "Reserved slots cannot be negative")
    private int reservedSlots;
    
    @Min(value = 0, message = "Rate must be positive")
    private double ratePerHour;
    
    private String rateType;
    
    @NotEmpty(message = "At least one vehicle type must be selected")
    private List<String> vehicleTypes;
    
    private boolean overflowAlert;
    private boolean autoRelease;
    private int releaseTimeout;
    private String color;
    private String status;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPrefix() { return prefix; }
    public void setPrefix(String prefix) { this.prefix = prefix; }
    public int getTotalSlots() { return totalSlots; }
    public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }
    public int getReservedSlots() { return reservedSlots; }
    public void setReservedSlots(int reservedSlots) { this.reservedSlots = reservedSlots; }
    public double getRatePerHour() { return ratePerHour; }
    public void setRatePerHour(double ratePerHour) { this.ratePerHour = ratePerHour; }
    public String getRateType() { return rateType; }
    public void setRateType(String rateType) { this.rateType = rateType; }
    public List<String> getVehicleTypes() { return vehicleTypes; }
    public void setVehicleTypes(List<String> vehicleTypes) { this.vehicleTypes = vehicleTypes; }
    public boolean isOverflowAlert() { return overflowAlert; }
    public void setOverflowAlert(boolean overflowAlert) { this.overflowAlert = overflowAlert; }
    public boolean isAutoRelease() { return autoRelease; }
    public void setAutoRelease(boolean autoRelease) { this.autoRelease = autoRelease; }
    public int getReleaseTimeout() { return releaseTimeout; }
    public void setReleaseTimeout(int releaseTimeout) { this.releaseTimeout = releaseTimeout; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
