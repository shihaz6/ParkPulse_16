package com.parkpulse.parking.model;

import com.parkpulse.model.AbstractEntity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "zones")
public class Zone extends AbstractEntity {
    private String name;
    private String prefix;
    private int totalSlots;
    private int reservedSlots;
    private double ratePerHour;
    private String rateType;

    @ElementCollection(fetch = FetchType.LAZY)
    private List<String> vehicleTypes;
    private boolean overflowAlert;
    private boolean autoRelease;
    private int releaseTimeout;
    private String color;
    private String status;

    public Zone() {
        super();
    }

    public Zone(String id, String name, String prefix, int totalSlots, int reservedSlots, 
                double ratePerHour, String rateType, List<String> vehicleTypes, 
                boolean overflowAlert, boolean autoRelease, int releaseTimeout, 
                String color, String status) {
        super(id);
        this.name = name;
        this.prefix = prefix;
        this.totalSlots = totalSlots;
        this.reservedSlots = reservedSlots;
        this.ratePerHour = ratePerHour;
        this.rateType = rateType;
        this.vehicleTypes = vehicleTypes;
        this.overflowAlert = overflowAlert;
        this.autoRelease = autoRelease;
        this.releaseTimeout = releaseTimeout;
        this.color = color;
        this.status = status;
    }

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

    @Override
    public String toDataString() {
        return String.join("|", 
            id, name, prefix, String.valueOf(totalSlots), String.valueOf(reservedSlots),
            String.valueOf(ratePerHour), rateType, String.join(",", vehicleTypes),
            String.valueOf(overflowAlert), String.valueOf(autoRelease), String.valueOf(releaseTimeout),
            color, status);
    }

    @Override
    public String toString() {
        return toDataString();
    }

    public static Zone fromString(String line) {
        String[] parts = line.split("\\|");
        if (parts.length < 13) return null;
        return new Zone(
            parts[0], parts[1], parts[2], 
            Integer.parseInt(parts[3]), Integer.parseInt(parts[4]), 
            Double.parseDouble(parts[5]), parts[6],
            Arrays.asList(parts[7].split(",")),
            Boolean.parseBoolean(parts[8]), Boolean.parseBoolean(parts[9]), Integer.parseInt(parts[10]),
            parts[11], parts[12]
        );
    }
}
