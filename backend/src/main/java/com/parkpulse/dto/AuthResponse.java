package com.parkpulse.dto;

import com.parkpulse.member.model.MemberVehicle;

import java.util.List;

public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private String access;
    private List<String> permissions;
    // Member profile fields
    private String name;
    private String email;
    private String plan;
    private String status;
    private String joinedDate;
    private int vehicles;
    private List<MemberVehicle> vehicleList;
    private String qrCode;
    private String billingCycle;
    private String nextRenewalDate;
    private long daysRemaining;

    public AuthResponse() {}
    public AuthResponse(String token, String username, String role) {
        this(token, username, role, null, null);
    }
    public AuthResponse(String token, String username, String role, String access, List<String> permissions) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.access = access;
        this.permissions = permissions;
    }

    public AuthResponse(String token, String username, String role, String access, List<String> permissions,
                        String name, String email, String plan, String status, String joinedDate,
                        int vehicles, List<MemberVehicle> vehicleList, String qrCode, String billingCycle, String nextRenewalDate, long daysRemaining) {
        this(token, username, role, access, permissions);
        this.name = name;
        this.email = email;
        this.plan = plan;
        this.status = status;
        this.joinedDate = joinedDate;
        this.vehicles = vehicles;
        this.vehicleList = vehicleList;
        this.qrCode = qrCode;
        this.billingCycle = billingCycle;
        this.nextRenewalDate = nextRenewalDate;
        this.daysRemaining = daysRemaining;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getAccess() { return access; }
    public void setAccess(String access) { this.access = access; }
    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }
    public int getVehicles() { return vehicles; }
    public void setVehicles(int vehicles) { this.vehicles = vehicles; }
    public List<MemberVehicle> getVehicleList() { return vehicleList; }
    public void setVehicleList(List<MemberVehicle> vehicleList) { this.vehicleList = vehicleList; }
    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    public String getBillingCycle() { return billingCycle; }
    public void setBillingCycle(String billingCycle) { this.billingCycle = billingCycle; }
    public String getNextRenewalDate() { return nextRenewalDate; }
    public void setNextRenewalDate(String nextRenewalDate) { this.nextRenewalDate = nextRenewalDate; }
    public long getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(long daysRemaining) { this.daysRemaining = daysRemaining; }
}
