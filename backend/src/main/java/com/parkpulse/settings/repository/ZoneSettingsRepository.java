package com.parkpulse.settings.repository;

import com.parkpulse.settings.model.ZoneSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ZoneSettingsRepository extends JpaRepository<ZoneSettings, String> {
    Optional<ZoneSettings> findById(String id);
}