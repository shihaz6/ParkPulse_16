package com.parkpulse.member.model;

import com.parkpulse.model.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "members")
public class Member extends AbstractEntity {
    private String name;
    private String email;
    @Column(unique = true, nullable = false)
    private String username;
    private String phone;
    private String password;
    private String plan;
    private String status;
    private String joinedDate;
    private int vehicles;
    private String billingCycle;

    public Member() {
        super();
    }

    public Member(String id, String name, String email, String plan, String status, String joinedDate) {
        super(id);
        this.name = name;
        this.email = email;
        this.plan = plan;
        this.status = status;
        this.joinedDate = joinedDate;
    }

    public Member(String id, String name, String email, String plan, String status, String joinedDate, int vehicles) {
        this(id, name, email, plan, status, joinedDate);
        this.vehicles = vehicles;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public int getVehicles() { return vehicles; }
    public void setVehicles(int vehicles) { this.vehicles = vehicles; }

    public String getBillingCycle() { return billingCycle; }
    public void setBillingCycle(String billingCycle) { this.billingCycle = billingCycle; }

    @Override
    public String toDataString() {
        return String.join("|", id, name, email, username != null ? username : "", phone != null ? phone : "", password != null ? password : "", plan, status, joinedDate, String.valueOf(vehicles), billingCycle != null ? billingCycle : "");
    }

    @Override
    public String toString() {
        return toDataString();
    }

    public static Member fromString(String line) {
        String[] parts = line.split("\\|");
        if (parts.length < 6) return null;
        Member m = new Member(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
        if (parts.length >= 7) {
            try { m.setVehicles(Integer.parseInt(parts[6])); } catch (NumberFormatException ignored) {}
        }
        if (parts.length >= 8) {
            m.setBillingCycle(parts[7].isEmpty() ? null : parts[7]);
        }
        return m;
    }
}
