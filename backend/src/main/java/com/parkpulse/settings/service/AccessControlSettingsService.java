package com.parkpulse.settings.service;

import com.parkpulse.settings.model.AccessControlSettings;

public interface AccessControlSettingsService {
    AccessControlSettings getSettings();
    void updateSettings(AccessControlSettings newSettings);
}