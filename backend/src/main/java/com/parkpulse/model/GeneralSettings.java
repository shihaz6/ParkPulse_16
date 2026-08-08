package com.parkpulse.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "general_settings")
public class GeneralSettings {

    @Id
    @Column(name = "id")
    private String id = "general";

    @Column(nullable = false)
    private String facilityName;

    @Column(nullable = false)
    private String timezone;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private boolean darkMode;

    @Column(nullable = false)
    private boolean autoRefresh;

    public GeneralSettings() {
    }

    public GeneralSettings(String facilityName, String timezone, String currency, boolean darkMode, boolean autoRefresh) {
        this.id = "general";
        this.facilityName = facilityName;
        this.timezone = timezone;
        this.currency = currency;
        this.darkMode = darkMode;
        this.autoRefresh = autoRefresh;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public boolean isDarkMode() { return darkMode; }
    public void setDarkMode(boolean darkMode) { this.darkMode = darkMode; }

    public boolean isAutoRefresh() { return autoRefresh; }
    public void setAutoRefresh(boolean autoRefresh) { this.autoRefresh = autoRefresh; }

    public String toDataString() {
        return String.join("|", facilityName, timezone, currency,
            String.valueOf(darkMode), String.valueOf(autoRefresh));
    }

    @Override
    public String toString() {
        return toDataString();
    }

    public static GeneralSettings fromString(String line) {
        String[] parts = line.split("\\|");
        if (parts.length < 5) return null;
        return new GeneralSettings(parts[0], parts[1], parts[2],
            Boolean.parseBoolean(parts[3]), Boolean.parseBoolean(parts[4]));
    }
}