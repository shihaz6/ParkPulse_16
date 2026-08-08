package com.parkpulse.settings.controller;

import com.parkpulse.settings.model.AccessControlSettings;
import com.parkpulse.settings.service.AccessControlSettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/access-control")
public class AccessControlSettingsController {

    @Autowired
    private AccessControlSettingsService accessControlSettingsService;

    @GetMapping
    public ResponseEntity<AccessControlSettings> getAccessControlSettings() {
        AccessControlSettings settings = accessControlSettingsService.getSettings();
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<AccessControlSettings> updateAccessControlSettings(@Valid @RequestBody AccessControlSettings settings) {
        accessControlSettingsService.updateSettings(settings);
        return ResponseEntity.ok(settings);
    }
}