package com.parkpulse.settings.repository;

import com.parkpulse.settings.model.AccessControlSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccessControlSettingsRepository extends JpaRepository<AccessControlSettings, String> {
    Optional<AccessControlSettings> findById(String id);
}