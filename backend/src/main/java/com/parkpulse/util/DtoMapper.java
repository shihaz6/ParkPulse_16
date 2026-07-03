package com.parkpulse.util;

import com.parkpulse.member.dto.PlanDTO;
import com.parkpulse.staff.dto.StaffDTO;
import com.parkpulse.parking.dto.ZoneDTO;
import com.parkpulse.member.model.Plan;
import com.parkpulse.staff.model.Staff;
import com.parkpulse.parking.model.Zone;

public class DtoMapper {

    // --- Zone Mapping ---
    public static ZoneDTO toDto(Zone zone) {
        if (zone == null) return null;
        ZoneDTO dto = new ZoneDTO();
        dto.setId(zone.getId());
        dto.setName(zone.getName());
        dto.setPrefix(zone.getPrefix());
        dto.setTotalSlots(zone.getTotalSlots());
        dto.setReservedSlots(zone.getReservedSlots());
        dto.setRatePerHour(zone.getRatePerHour());
        dto.setRateType(zone.getRateType());
        dto.setVehicleTypes(zone.getVehicleTypes());
        dto.setOverflowAlert(zone.isOverflowAlert());
        dto.setAutoRelease(zone.isAutoRelease());
        dto.setReleaseTimeout(zone.getReleaseTimeout());
        dto.setColor(zone.getColor());
        dto.setStatus(zone.getStatus());
        return dto;
    }

    public static Zone toEntity(ZoneDTO dto) {
        if (dto == null) return null;
        return new Zone(
            dto.getId(),
            dto.getName(),
            dto.getPrefix(),
            dto.getTotalSlots(),
            dto.getReservedSlots(),
            dto.getRatePerHour(),
            dto.getRateType(),
            dto.getVehicleTypes(),
            dto.isOverflowAlert(),
            dto.isAutoRelease(),
            dto.getReleaseTimeout(),
            dto.getColor(),
            dto.getStatus()
        );
    }

    // --- Staff Mapping ---
    public static StaffDTO toDto(Staff staff) {
        if (staff == null) return null;
        StaffDTO dto = new StaffDTO();
        dto.setId(staff.getId());
        dto.setName(staff.getName());
        dto.setRole(staff.getRole());
        dto.setEmail(staff.getEmail());
        dto.setUsername(staff.getUsername());
        // We purposefully omit the password when sending data back to the frontend for security.
        dto.setAccess(staff.getAccess());
        dto.setActive(staff.isActive());
        dto.setCustomPermissions(staff.getCustomPermissions());
        
        dto.setAvatar(staff.getAvatar());
        dto.setPhone(staff.getPhone());
        dto.setJoinDate(staff.getJoinDate());
        dto.setAddress(staff.getAddress());
        dto.setVehicleNumber(staff.getVehicleNumber());
        dto.setVehicleType(staff.getVehicleType());
        dto.setShift(staff.getShift());
        dto.setStatus(staff.getStatus());
        return dto;
    }

    public static Staff toEntity(StaffDTO dto) {
        if (dto == null) return null;
        return new Staff(
            dto.getId(),
            dto.getName(),
            dto.getRole(),
            dto.getEmail(),
            dto.getUsername(),
            dto.getPassword(),
            dto.getAccess(),
            dto.isActive(),
            dto.getCustomPermissions(),
            dto.getAvatar(),
            dto.getPhone(),
            dto.getJoinDate(),
            dto.getAddress(),
            dto.getVehicleNumber(),
            dto.getVehicleType(),
            dto.getShift(),
            dto.getStatus()
        );
    }

    // --- Plan Mapping ---
    public static PlanDTO toDto(Plan plan) {
        if (plan == null) return null;
        PlanDTO dto = new PlanDTO();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        dto.setMonthlyPrice(plan.getMonthlyPrice());
        dto.setAnnualPrice(plan.getAnnualPrice());
        dto.setMaxVehicles(plan.getMaxVehicles());
        dto.setColor(plan.getColor());
        dto.setFeatures(plan.getFeatures());
        dto.setPopular(plan.isPopular());
        dto.setStatus(plan.getStatus());
        return dto;
    }

    public static Plan toEntity(PlanDTO dto) {
        if (dto == null) return null;
        return new Plan(
            dto.getId(),
            dto.getName(),
            dto.getDescription(),
            dto.getMonthlyPrice(),
            dto.getAnnualPrice(),
            dto.getColor(),
            dto.getFeatures(),
            dto.getMaxVehicles(),
            dto.getStatus(),
            dto.isPopular()
        );
    }
}
