package com.parkpulse.settings.model;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "zone_settings")
public class ZoneSettings {

    @Id
    @Column(name = "id")
    private String id = "zone_defaults";

    private int defaultTotalSlots = 10;
    private int defaultReservedSlots = 0;
    private double defaultRatePerHour = 10.0;
    private String defaultRateType = "Flat hourly rate";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "zone_settings_vehicle_types", joinColumns = @JoinColumn(name = "zone_settings_id"))
    @Column(name = "vehicle_type")
    private List<String> defaultVehicleTypes = new ArrayList<>(Arrays.asList("Car"));

    private boolean defaultOverflowAlert = true;
    private boolean defaultAutoRelease = false;
    private int defaultReleaseTimeout = 120;

    public ZoneSettings() {
    }

    public ZoneSettings(String id) {
        this.id = id;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getDefaultTotalSlots() { return defaultTotalSlots; }
    public void setDefaultTotalSlots(int defaultTotalSlots) { this.defaultTotalSlots = defaultTotalSlots; }

    public int getDefaultReservedSlots() { return defaultReservedSlots; }
    public void setDefaultReservedSlots(int defaultReservedSlots) { this.defaultReservedSlots = defaultReservedSlots; }

    public double getDefaultRatePerHour() { return defaultRatePerHour; }
    public void setDefaultRatePerHour(double defaultRatePerHour) { this.defaultRatePerHour = defaultRatePerHour; }

    public String getDefaultRateType() { return defaultRateType; }
    public void setDefaultRateType(String defaultRateType) { this.defaultRateType = defaultRateType; }

    public List<String> getDefaultVehicleTypes() { return defaultVehicleTypes; }
    public void setDefaultVehicleTypes(List<String> defaultVehicleTypes) { this.defaultVehicleTypes = defaultVehicleTypes; }

    public boolean isDefaultOverflowAlert() { return defaultOverflowAlert; }
    public void setDefaultOverflowAlert(boolean defaultOverflowAlert) { this.defaultOverflowAlert = defaultOverflowAlert; }

    public boolean isDefaultAutoRelease() { return defaultAutoRelease; }
    public void setDefaultAutoRelease(boolean defaultAutoRelease) { this.defaultAutoRelease = defaultAutoRelease; }

    public int getDefaultReleaseTimeout() { return defaultReleaseTimeout; }
    public void setDefaultReleaseTimeout(int defaultReleaseTimeout) { this.defaultReleaseTimeout = defaultReleaseTimeout; }
}