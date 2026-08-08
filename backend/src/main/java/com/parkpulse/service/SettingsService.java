package com.parkpulse.service;

import com.parkpulse.model.GeneralSettings;
import com.parkpulse.model.SecuritySettings;

public interface SettingsService {
    GeneralSettings getSettings();
    void updateSettings(GeneralSettings newSettings);
    SecuritySettings getSecuritySettings();
    void updateSecuritySettings(SecuritySettings newSettings);
}
