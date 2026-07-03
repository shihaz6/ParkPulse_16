package com.parkpulse.history.dto;

import java.time.LocalDateTime;

public class HistoryFiltersDTO {
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private String zoneId;
    private String vehiclePlate;
    private String status;
    private String memberId;
    private int page = 0;
    private int size = 20;

    public LocalDateTime getDateFrom() { return dateFrom; }
    public void setDateFrom(LocalDateTime dateFrom) { this.dateFrom = dateFrom; }

    public LocalDateTime getDateTo() { return dateTo; }
    public void setDateTo(LocalDateTime dateTo) { this.dateTo = dateTo; }

    public String getZoneId() { return zoneId; }
    public void setZoneId(String zoneId) { this.zoneId = zoneId; }

    public String getVehiclePlate() { return vehiclePlate; }
    public void setVehiclePlate(String vehiclePlate) { this.vehiclePlate = vehiclePlate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}