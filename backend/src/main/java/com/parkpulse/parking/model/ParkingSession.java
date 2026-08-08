package com.parkpulse.parking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "parking_sessions")
public class ParkingSession {
    @Id
    private String id;
    private String slotId;
    private String vehicle;
    private String entryTime;
    private String exitTime;

    public ParkingSession() {
    }

    public ParkingSession(String id, String slotId, String vehicle, String entryTime, String exitTime) {
        this.id = id;
        this.slotId = slotId;
        this.vehicle = vehicle;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public String getVehicle() { return vehicle; }
    public void setVehicle(String vehicle) { this.vehicle = vehicle; }

    public String getEntryTime() { return entryTime; }
    public void setEntryTime(String entryTime) { this.entryTime = entryTime; }

    public String getExitTime() { return exitTime; }
    public void setExitTime(String exitTime) { this.exitTime = exitTime; }
}
