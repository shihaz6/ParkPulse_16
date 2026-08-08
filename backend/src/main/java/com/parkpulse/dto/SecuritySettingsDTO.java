package com.parkpulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SecuritySettingsDTO {
    @NotBlank
    private String sessionTimeout;
    
    @NotNull
    private Boolean limitEnabled;
    
    @NotBlank
    private String maxFailedAttempts;
    
    @NotBlank
    private String lockoutDuration;

    public String getSessionTimeout() { return sessionTimeout; }
    public void setSessionTimeout(String sessionTimeout) { this.sessionTimeout = sessionTimeout; }
    
    public Boolean getLimitEnabled() { return limitEnabled; }
    public void setLimitEnabled(Boolean limitEnabled) { this.limitEnabled = limitEnabled; }
    
    public String getMaxFailedAttempts() { return maxFailedAttempts; }
    public void setMaxFailedAttempts(String maxFailedAttempts) { this.maxFailedAttempts = maxFailedAttempts; }
    
    public String getLockoutDuration() { return lockoutDuration; }
    public void setLockoutDuration(String lockoutDuration) { this.lockoutDuration = lockoutDuration; }
}