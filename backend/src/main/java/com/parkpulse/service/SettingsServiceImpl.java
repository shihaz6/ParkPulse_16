package com.parkpulse.service;

import com.parkpulse.model.GeneralSettings;
import com.parkpulse.model.SecuritySettings;
import com.parkpulse.repository.GeneralSettingsRepository;
import com.parkpulse.repository.SecuritySettingsRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SettingsServiceImpl implements SettingsService {

    @Autowired
    private GeneralSettingsRepository generalSettingsRepository;

    @Autowired
    private SecuritySettingsRepository securitySettingsRepository;

    @PostConstruct
    public void init() {
        if (!generalSettingsRepository.existsById("general")) {
            GeneralSettings defaultSettings = new GeneralSettings(
                "ParkPulse Main Lot",
                "UTC-05:00",
                "lkr",
                true,
                true
            );
            defaultSettings.setId("general");
            generalSettingsRepository.save(defaultSettings);
        }

        if (!securitySettingsRepository.existsById("security")) {
            SecuritySettings defaultSecuritySettings = new SecuritySettings(
                "30m",
                true,
                "5",
                "15m"
            );
            defaultSecuritySettings.setId("security");
            securitySettingsRepository.save(defaultSecuritySettings);
        }
    }

    @Override
    public GeneralSettings getSettings() {
        return generalSettingsRepository.findById("general").orElse(null);
    }

    @Override
    public void updateSettings(GeneralSettings newSettings) {
        newSettings.setId("general");
        generalSettingsRepository.save(newSettings);
    }

    @Override
    public SecuritySettings getSecuritySettings() {
        return securitySettingsRepository.findById("security").orElse(null);
    }

    @Override
    public void updateSecuritySettings(SecuritySettings newSettings) {
        newSettings.setId("security");
        securitySettingsRepository.save(newSettings);
    }
}
