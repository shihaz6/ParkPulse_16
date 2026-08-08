package com.parkpulse.member.model;

import com.parkpulse.model.AbstractEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "member_vehicles")
public class MemberVehicle extends AbstractEntity {
    private String plate;
    private String vehicleType;
    private String make;
    private String color;

    @ManyToOne
    @JoinColumn(name = "member_id")
    @JsonIgnore
    private Member member;

    public MemberVehicle() {
        super();
    }

    public MemberVehicle(String plate, String vehicleType, String make, String color) {
        super();
        this.plate = plate;
        this.vehicleType = vehicleType;
        this.make = make;
        this.color = color;
    }

    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    @Override
    public String toDataString() {
        return String.join("|", plate != null ? plate : "", vehicleType != null ? vehicleType : "",
                make != null ? make : "", color != null ? color : "");
    }

    @Override
    public String toString() {
        return toDataString();
    }
}
