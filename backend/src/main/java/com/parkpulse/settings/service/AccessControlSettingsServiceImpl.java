package com.parkpulse.settings.service;

import com.parkpulse.settings.model.AccessControlSettings;
import com.parkpulse.settings.repository.AccessControlSettingsRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AccessControlSettingsServiceImpl implements AccessControlSettingsService {

    @Autowired
    private AccessControlSettingsRepository accessControlSettingsRepository;

    @PostConstruct
    public void init() {
        if (!accessControlSettingsRepository.existsById("access_defaults")) {
            AccessControlSettings defaultSettings = new AccessControlSettings("access_defaults");
            accessControlSettingsRepository.save(defaultSettings);
        }
    }

    @Override
    public AccessControlSettings getSettings() {
        return accessControlSettingsRepository.findById("access_defaults").orElseGet(() -> {
            AccessControlSettings defaults = new AccessControlSettings("access_defaults");
            return accessControlSettingsRepository.save(defaults);
        });
    }

    @Override
    public void updateSettings(AccessControlSettings newSettings) {
        newSettings.setId("access_defaults");
        accessControlSettingsRepository.save(newSettings);
    }
}