package com.parkpulse.settings.service;

import com.parkpulse.settings.model.ZoneSettings;
import com.parkpulse.settings.repository.ZoneSettingsRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ZoneSettingsServiceImpl implements ZoneSettingsService {

    @Autowired
    private ZoneSettingsRepository zoneSettingsRepository;

    @PostConstruct
    public void init() {
        if (!zoneSettingsRepository.existsById("zone_defaults")) {
            ZoneSettings defaultSettings = new ZoneSettings("zone_defaults");
            zoneSettingsRepository.save(defaultSettings);
        }
    }

    @Override
    public ZoneSettings getSettings() {
        return zoneSettingsRepository.findById("zone_defaults").orElseGet(() -> {
            ZoneSettings defaults = new ZoneSettings("zone_defaults");
            return zoneSettingsRepository.save(defaults);
        });
    }

    @Override
    public void updateSettings(ZoneSettings newSettings) {
        newSettings.setId("zone_defaults");
        zoneSettingsRepository.save(newSettings);
    }
}