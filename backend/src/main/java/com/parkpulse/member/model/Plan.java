package com.parkpulse.member.model;

import com.parkpulse.model.AbstractEntity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "plans")
public class Plan extends AbstractEntity {
    private String name;
    private String description;
    private double monthlyPrice;
    private double annualPrice;
    private String color;

    @ElementCollection(fetch = FetchType.LAZY)
    private List<String> features;
    private String maxVehicles; // e.g., "1", "3", "unlimited"
    private String status;
    private boolean popular;

    public Plan() {
        super();
    }

    public Plan(String id, String name, String description, double monthlyPrice, double annualPrice, 
                String color, List<String> features, String maxVehicles, String status, boolean popular) {
        super(id);
        this.name = name;
        this.description = description;
        this.monthlyPrice = monthlyPrice;
        this.annualPrice = annualPrice;
        this.color = color;
        this.features = features;
        this.maxVehicles = maxVehicles;
        this.status = status;
        this.popular = popular;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(double monthlyPrice) { this.monthlyPrice = monthlyPrice; }

    public double getAnnualPrice() { return annualPrice; }
    public void setAnnualPrice(double annualPrice) { this.annualPrice = annualPrice; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }

    public String getMaxVehicles() { return maxVehicles; }
    public void setMaxVehicles(String maxVehicles) { this.maxVehicles = maxVehicles; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isPopular() { return popular; }
    public void setPopular(boolean popular) { this.popular = popular; }

    public int calculateAnnualSavingsPercent() {
        if (monthlyPrice <= 0) return 0;
        double totalMonthly = monthlyPrice * 12;
        if (annualPrice >= totalMonthly) return 0;
        return (int) Math.round(((totalMonthly - annualPrice) / totalMonthly) * 100);
    }

    @Override
    public String toDataString() {
        return String.join("|", 
            id, name, description, String.valueOf(monthlyPrice), String.valueOf(annualPrice),
            color, String.join(",", features), maxVehicles, status, String.valueOf(popular));
    }

    @Override
    public String toString() {
        return toDataString();
    }

    public static Plan fromString(String line) {
        String[] parts = line.split("\\|");
        if (parts.length < 10) return null;
        return new Plan(
            parts[0], parts[1], parts[2], 
            Double.parseDouble(parts[3]), Double.parseDouble(parts[4]), 
            parts[5], Arrays.asList(parts[6].split(",")), parts[7], parts[8], 
            Boolean.parseBoolean(parts[9])
        );
    }
}
