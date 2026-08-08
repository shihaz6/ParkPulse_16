package com.parkpulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class GeneralSettingsDTO {
    @NotBlank
    private String facilityName;
    
    @NotBlank
    private String timezone;
    
    @NotBlank
    private String currency;
    
    @NotNull
    private Boolean darkMode;
    
    @NotNull
    private Boolean autoRefresh;

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Boolean getDarkMode() { return darkMode; }
    public void setDarkMode(Boolean darkMode) { this.darkMode = darkMode; }
    
    public Boolean getAutoRefresh() { return autoRefresh; }
    public void setAutoRefresh(Boolean autoRefresh) { this.autoRefresh = autoRefresh; }
}