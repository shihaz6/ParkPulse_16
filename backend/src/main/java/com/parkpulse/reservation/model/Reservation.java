package com.parkpulse.reservation.model;

import com.parkpulse.model.AbstractEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "reservations")
public class Reservation extends AbstractEntity {
    private String slotId;
    private String reservedFor;
    private String reservedForType; // member | staff
    private String reservedForEmail;
    private String plate;
    private String vehicleType;
    private String ownerName;
    private String entryTime;
    private String exitTime;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;

    private String reservedAt;

    public Reservation() {
        super();
    }

    public Reservation(String id, String slotId, String reservedFor, String reservedForType,
                       String reservedForEmail, ReservationStatus status, String reservedAt) {
        super(id);
        this.slotId = slotId;
        this.reservedFor = reservedFor;
        this.reservedForType = reservedForType;
        this.reservedForEmail = reservedForEmail;
        this.status = status;
        this.reservedAt = reservedAt;
    }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public String getReservedFor() { return reservedFor; }
    public void setReservedFor(String reservedFor) { this.reservedFor = reservedFor; }

    public String getReservedForType() { return reservedForType; }
    public void setReservedForType(String reservedForType) { this.reservedForType = reservedForType; }

    public String getReservedForEmail() { return reservedForEmail; }
    public void setReservedForEmail(String reservedForEmail) { this.reservedForEmail = reservedForEmail; }

    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getEntryTime() { return entryTime; }
    public void setEntryTime(String entryTime) { this.entryTime = entryTime; }

    public String getExitTime() { return exitTime; }
    public void setExitTime(String exitTime) { this.exitTime = exitTime; }

    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }

    public String getReservedAt() { return reservedAt; }
    public void setReservedAt(String reservedAt) { this.reservedAt = reservedAt; }

    @Override
    public String toDataString() {
        return String.join("|",
            id, slotId, reservedFor, reservedForType != null ? reservedForType : "",
            reservedForEmail != null ? reservedForEmail : "",
            plate != null ? plate : "",
            vehicleType != null ? vehicleType : "",
            ownerName != null ? ownerName : "",
            entryTime != null ? entryTime : "",
            exitTime != null ? exitTime : "",
            status != null ? status.name() : "",
            reservedAt != null ? reservedAt : "");
    }

    @Override
    public String toString() {
        return toDataString();
    }
}
