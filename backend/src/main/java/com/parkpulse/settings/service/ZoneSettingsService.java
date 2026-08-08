package com.parkpulse.settings.service;

import com.parkpulse.settings.model.ZoneSettings;

public interface ZoneSettingsService {
    ZoneSettings getSettings();
    void updateSettings(ZoneSettings newSettings);
}