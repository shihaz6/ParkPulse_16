package com.parkpulse.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "security_settings")
public class SecuritySettings {

    @Id
    @Column(name = "id")
    private String id = "security";

    @Column(nullable = false)
    private String sessionTimeout;

    @Column(nullable = false)
    private boolean limitEnabled;

    @Column(nullable = false)
    private String maxFailedAttempts;

    @Column(nullable = false)
    private String lockoutDuration;

    public SecuritySettings() {
    }

    public SecuritySettings(String sessionTimeout, boolean limitEnabled, String maxFailedAttempts, String lockoutDuration) {
        this.id = "security";
        this.sessionTimeout = sessionTimeout;
        this.limitEnabled = limitEnabled;
        this.maxFailedAttempts = maxFailedAttempts;
        this.lockoutDuration = lockoutDuration;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionTimeout() { return sessionTimeout; }
    public void setSessionTimeout(String sessionTimeout) { this.sessionTimeout = sessionTimeout; }

    public boolean isLimitEnabled() { return limitEnabled; }
    public void setLimitEnabled(boolean limitEnabled) { this.limitEnabled = limitEnabled; }

    public String getMaxFailedAttempts() { return maxFailedAttempts; }
    public void setMaxFailedAttempts(String maxFailedAttempts) { this.maxFailedAttempts = maxFailedAttempts; }

    public String getLockoutDuration() { return lockoutDuration; }
    public void setLockoutDuration(String lockoutDuration) { this.lockoutDuration = lockoutDuration; }

    public String toDataString() {
        return String.join("|",
            sessionTimeout,
            String.valueOf(limitEnabled),
            maxFailedAttempts,
            lockoutDuration
        );
    }

    @Override
    public String toString() {
        return toDataString();
    }

    public static SecuritySettings fromString(String line) {
        String[] parts = line.split("\\|");
        if (parts.length < 4) return null;
        return new SecuritySettings(
            parts[0],
            Boolean.parseBoolean(parts[1]),
            parts[2],
            parts[3]
        );
    }
}