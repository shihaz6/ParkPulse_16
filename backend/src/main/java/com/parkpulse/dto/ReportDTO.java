package com.parkpulse.dto;

public class ReportDTO {
    private Long id;
    private String name;
    private String type;
    private String format;
    private String dateRange;
    private String generatedAt;
    private String status;
    private int sizeKb;
    private String generatedBy;
    private boolean fixed;
    private String fixedAt;
    private String fixedBy;
    private String description;

    public ReportDTO() {}

    public ReportDTO(Long id, String name, String type, String format, String dateRange,
                     String generatedAt, String status, int sizeKb, String generatedBy,
                     boolean fixed, String fixedAt, String fixedBy, String description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.format = format;
        this.dateRange = dateRange;
        this.generatedAt = generatedAt;
        this.status = status;
        this.sizeKb = sizeKb;
        this.generatedBy = generatedBy;
        this.fixed = fixed;
        this.fixedAt = fixedAt;
        this.fixedBy = fixedBy;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
    public String getDateRange() { return dateRange; }
    public void setDateRange(String dateRange) { this.dateRange = dateRange; }
    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getSizeKb() { return sizeKb; }
    public void setSizeKb(int sizeKb) { this.sizeKb = sizeKb; }
    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }
    public boolean isFixed() { return fixed; }
    public void setFixed(boolean fixed) { this.fixed = fixed; }
    public String getFixedAt() { return fixedAt; }
    public void setFixedAt(String fixedAt) { this.fixedAt = fixedAt; }
    public String getFixedBy() { return fixedBy; }
    public void setFixedBy(String fixedBy) { this.fixedBy = fixedBy; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
