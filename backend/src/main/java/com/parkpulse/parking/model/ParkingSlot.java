package com.parkpulse.parking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "parking_slots")
public class ParkingSlot {
    @Id
    private String id;
    private boolean occupied;
    private boolean reserved;
    private boolean maintenance;
    private String vehicle;
    private String vehicleType;
    private String ownerName;
    private String phone;
    private String notes;
    private String entryTime;
    private String maintenanceNotes;

    public ParkingSlot() {
    }

    public ParkingSlot(String id, boolean occupied, boolean reserved, boolean maintenance,
                       String vehicle, String vehicleType, String ownerName, String phone, String notes,
                       String entryTime) {
        this.id = id;
        this.occupied = occupied;
        this.reserved = reserved;
        this.maintenance = maintenance;
        this.vehicle = vehicle;
        this.vehicleType = vehicleType;
        this.ownerName = ownerName;
        this.phone = phone;
        this.notes = notes;
        this.entryTime = entryTime;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public boolean isOccupied() { return occupied; }
    public void setOccupied(boolean occupied) { this.occupied = occupied; }

    public boolean isReserved() { return reserved; }
    public void setReserved(boolean reserved) { this.reserved = reserved; }

    public boolean isMaintenance() { return maintenance; }
    public void setMaintenance(boolean maintenance) { this.maintenance = maintenance; }

    public String getVehicle() { return vehicle; }
    public void setVehicle(String vehicle) { this.vehicle = vehicle; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getEntryTime() { return entryTime; }
    public void setEntryTime(String entryTime) { this.entryTime = entryTime; }

    public String getMaintenanceNotes() { return maintenanceNotes; }
    public void setMaintenanceNotes(String maintenanceNotes) { this.maintenanceNotes = maintenanceNotes; }
}
