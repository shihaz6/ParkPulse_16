package com.parkpulse.settings.controller;

import com.parkpulse.settings.model.ZoneSettings;
import com.parkpulse.settings.service.ZoneSettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/zones")
public class ZoneSettingsController {

    @Autowired
    private ZoneSettingsService zoneSettingsService;

    @GetMapping
    public ResponseEntity<ZoneSettings> getZoneSettings() {
        ZoneSettings settings = zoneSettingsService.getSettings();
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<ZoneSettings> updateZoneSettings(@Valid @RequestBody ZoneSettings settings) {
        zoneSettingsService.updateSettings(settings);
        return ResponseEntity.ok(settings);
    }
}