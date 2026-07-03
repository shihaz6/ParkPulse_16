package com.parkpulse.member.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class PlanDTO {
    private String id;
    
    @NotBlank(message = "Plan name is required")
    private String name;
    
    private String description;
    
    @Min(value = 0, message = "Monthly price cannot be negative")
    private double monthlyPrice;
    
    @Min(value = 0, message = "Annual price cannot be negative")
    private double annualPrice;
    
    private String color;
    
    @NotEmpty(message = "Plan must have at least one feature")
    private List<String> features;
    
    @NotBlank(message = "Max vehicles specification is required")
    private String maxVehicles;
    
    private String status;
    private boolean popular;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
}
