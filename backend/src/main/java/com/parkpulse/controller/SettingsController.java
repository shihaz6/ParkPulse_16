package com.parkpulse.controller;

import com.parkpulse.dto.GeneralSettingsDTO;
import com.parkpulse.dto.SecuritySettingsDTO;
import com.parkpulse.model.GeneralSettings;
import com.parkpulse.model.SecuritySettings;
import com.parkpulse.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @GetMapping("/general")
    public ResponseEntity<GeneralSettingsDTO> getGeneralSettings() {
        GeneralSettings settings = settingsService.getSettings();
        if (settings == null) {
            // Create defaults if missing
            settings = new GeneralSettings(
                "ParkPulse Main Lot",
                "UTC-05:00",
                "lkr",
                true,
                true
            );
            settings.setId("general");
            settingsService.updateSettings(settings);
        }
        return ResponseEntity.ok(toDTO(settings));
    }

    @PutMapping("/general")
    public ResponseEntity<GeneralSettingsDTO> updateGeneralSettings(@Valid @RequestBody GeneralSettingsDTO dto) {
        GeneralSettings settings = toEntity(dto);
        settingsService.updateSettings(settings);
        return ResponseEntity.ok(toDTO(settings));
    }

    @GetMapping("/security")
    public ResponseEntity<SecuritySettingsDTO> getSecuritySettings() {
        SecuritySettings settings = settingsService.getSecuritySettings();
        if (settings == null) {
            // Create defaults if missing
            settings = new SecuritySettings(
                "30m",
                true,
                "5",
                "15m"
            );
            settings.setId("security");
            settingsService.updateSecuritySettings(settings);
        }
        return ResponseEntity.ok(toDTO(settings));
    }

    @PutMapping("/security")
    public ResponseEntity<SecuritySettingsDTO> updateSecuritySettings(@Valid @RequestBody SecuritySettingsDTO dto) {
        SecuritySettings settings = toEntity(dto);
        settingsService.updateSecuritySettings(settings);
        return ResponseEntity.ok(toDTO(settings));
    }

    private GeneralSettingsDTO toDTO(GeneralSettings s) {
        GeneralSettingsDTO dto = new GeneralSettingsDTO();
        dto.setFacilityName(s.getFacilityName());
        dto.setTimezone(s.getTimezone());
        dto.setCurrency(s.getCurrency());
        dto.setDarkMode(s.isDarkMode());
        dto.setAutoRefresh(s.isAutoRefresh());
        return dto;
    }

    private GeneralSettings toEntity(GeneralSettingsDTO dto) {
        GeneralSettings s = new GeneralSettings();
        s.setFacilityName(dto.getFacilityName());
        s.setTimezone(dto.getTimezone());
        s.setCurrency(dto.getCurrency());
        s.setDarkMode(dto.getDarkMode());
        s.setAutoRefresh(dto.getAutoRefresh());
        return s;
    }

    private SecuritySettingsDTO toDTO(SecuritySettings s) {
        SecuritySettingsDTO dto = new SecuritySettingsDTO();
        dto.setSessionTimeout(s.getSessionTimeout());
        dto.setLimitEnabled(s.isLimitEnabled());
        dto.setMaxFailedAttempts(s.getMaxFailedAttempts());
        dto.setLockoutDuration(s.getLockoutDuration());
        return dto;
    }

    private SecuritySettings toEntity(SecuritySettingsDTO dto) {
        SecuritySettings s = new SecuritySettings();
        s.setSessionTimeout(dto.getSessionTimeout());
        s.setLimitEnabled(dto.getLimitEnabled());
        s.setMaxFailedAttempts(dto.getMaxFailedAttempts());
        s.setLockoutDuration(dto.getLockoutDuration());
        return s;
    }
}