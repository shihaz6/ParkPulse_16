package com.parkpulse.staff.model;

import com.parkpulse.model.AbstractEntity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "staff")
public class Staff extends AbstractEntity {
    private String name;
    private String role;
    private String email;
    private String username;
    private String password;
    private String access;
    private boolean active;

    @ElementCollection(fetch = FetchType.LAZY)
    private List<String> customPermissions;
    
    private String avatar;
    private String phone;
    private String joinDate;
    private String address;
    private String vehicleNumber;
    private String vehicleType;
    private String shift;
    private String status; // Active, Inactive, Off Duty, etc.

    public Staff() {
        super();
        this.customPermissions = new ArrayList<>();
    }

    public Staff(String id, String name, String role, String email, String username, String password, String access, boolean active, List<String> customPermissions) {
        super(id);
        this.name = name;
        this.role = role;
        this.email = email;
        this.username = username;
        this.password = password;
        this.access = access;
        this.active = active;
        this.customPermissions = customPermissions != null ? customPermissions : new ArrayList<>();
    }

    public Staff(String id, String name, String role, String email, String username, String password, String access, boolean active, List<String> customPermissions,
                 String avatar, String phone, String joinDate, String address, String vehicleNumber, String vehicleType, String shift, String status) {
        super(id);
        this.name = name;
        this.role = role;
        this.email = email;
        this.username = username;
        this.password = password;
        this.access = access;
        this.active = active;
        this.customPermissions = customPermissions != null ? customPermissions : new ArrayList<>();
        this.avatar = avatar;
        this.phone = phone;
        this.joinDate = joinDate;
        this.address = address;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
        this.shift = shift;
        this.status = status;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAccess() { return access; }
    public void setAccess(String access) { this.access = access; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<String> getCustomPermissions() { return customPermissions; }
    public void setCustomPermissions(List<String> customPermissions) { this.customPermissions = customPermissions; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getJoinDate() { return joinDate; }
    public void setJoinDate(String joinDate) { this.joinDate = joinDate; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toDataString() {
        String permsStr = customPermissions == null || customPermissions.isEmpty() ? "" : String.join(",", customPermissions);
        return String.join("|", 
                id, 
                name == null ? "" : name, 
                role == null ? "" : role, 
                email == null ? "" : email, 
                username == null ? "" : username, 
                password == null ? "" : password, 
                access == null ? "" : access, 
                String.valueOf(active), 
                permsStr,
                avatar == null ? "" : avatar,
                phone == null ? "" : phone,
                joinDate == null ? "" : joinDate,
                address == null ? "" : address,
                vehicleNumber == null ? "" : vehicleNumber,
                vehicleType == null ? "" : vehicleType,
                shift == null ? "" : shift,
                status == null ? "" : status
        );
    }

    @Override
    public String toString() {
        return toDataString();
    }

    public static Staff fromString(String line) {
        String[] parts = line.split("\\|", -1);
        if (parts.length < 9) {
            if (parts.length == 8) {
                return new Staff(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], Boolean.parseBoolean(parts[7]), new ArrayList<>());
            }
            if (parts.length == 6) {
                return new Staff(parts[0], parts[1], parts[2], parts[3], "", "", parts[4], Boolean.parseBoolean(parts[5]), new ArrayList<>());
            }
            return null;
        }
        
        List<String> perms = parts[8].isEmpty() ? new ArrayList<>() : new ArrayList<>(Arrays.asList(parts[8].split(",")));
        
        if (parts.length >= 17) {
            return new Staff(
                    parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], Boolean.parseBoolean(parts[7]), perms,
                    parts[9], parts[10], parts[11], parts[12], parts[13], parts[14], parts[15], parts[16]
            );
        }
        
        return new Staff(
                parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], Boolean.parseBoolean(parts[7]), perms,
                "", "", "", "", "", "", "", parts[7].equalsIgnoreCase("true") ? "Active" : "Inactive"
        );
    }
}
