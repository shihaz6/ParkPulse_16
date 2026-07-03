package com.parkpulse.settings.model;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;

@Entity
@Table(name = "access_control_settings")
public class AccessControlSettings {

    @Id
    @Column(name = "id")
    private String id = "access_defaults";

    private String defaultAdminPermissions = "*";
    private String defaultManagerPermissions = "zones,reports,analytics";
    private String defaultOperatorPermissions = "slots,dashboard";
    private String defaultViewerPermissions = "dashboard";
    private String customRolesJson = "[]";

    private int maxConcurrentSessions = 5;
    private boolean requireMfaForAdmin = false;
    private boolean requireMfaForManager = false;
    private int sessionTimeoutMinutes = 480;
    private boolean allowPasswordReset = true;
    private int maxFailedLoginAttempts = 5;
    private int lockoutDurationMinutes = 15;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "access_control_default_permissions", joinColumns = @JoinColumn(name = "access_settings_id"))
    @Column(name = "permission")
    private java.util.List<String> defaultCustomPermissions = new java.util.ArrayList<>(java.util.Arrays.asList("dashboard"));

    public AccessControlSettings() {
    }

    public AccessControlSettings(String id) {
        this.id = id;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDefaultAdminPermissions() { return defaultAdminPermissions; }
    public void setDefaultAdminPermissions(String defaultAdminPermissions) { this.defaultAdminPermissions = defaultAdminPermissions; }

    public String getDefaultManagerPermissions() { return defaultManagerPermissions; }
    public void setDefaultManagerPermissions(String defaultManagerPermissions) { this.defaultManagerPermissions = defaultManagerPermissions; }

    public String getDefaultOperatorPermissions() { return defaultOperatorPermissions; }
    public void setDefaultOperatorPermissions(String defaultOperatorPermissions) { this.defaultOperatorPermissions = defaultOperatorPermissions; }

    public String getDefaultViewerPermissions() { return defaultViewerPermissions; }
    public void setDefaultViewerPermissions(String defaultViewerPermissions) { this.defaultViewerPermissions = defaultViewerPermissions; }

    public String getCustomRolesJson() { return customRolesJson; }
    public void setCustomRolesJson(String customRolesJson) { this.customRolesJson = customRolesJson; }

    public int getMaxConcurrentSessions() { return maxConcurrentSessions; }
    public void setMaxConcurrentSessions(int maxConcurrentSessions) { this.maxConcurrentSessions = maxConcurrentSessions; }

    public boolean isRequireMfaForAdmin() { return requireMfaForAdmin; }
    public void setRequireMfaForAdmin(boolean requireMfaForAdmin) { this.requireMfaForAdmin = requireMfaForAdmin; }

    public boolean isRequireMfaForManager() { return requireMfaForManager; }
    public void setRequireMfaForManager(boolean requireMfaForManager) { this.requireMfaForManager = requireMfaForManager; }

    public int getSessionTimeoutMinutes() { return sessionTimeoutMinutes; }
    public void setSessionTimeoutMinutes(int sessionTimeoutMinutes) { this.sessionTimeoutMinutes = sessionTimeoutMinutes; }

    public boolean isAllowPasswordReset() { return allowPasswordReset; }
    public void setAllowPasswordReset(boolean allowPasswordReset) { this.allowPasswordReset = allowPasswordReset; }

    public int getMaxFailedLoginAttempts() { return maxFailedLoginAttempts; }
    public void setMaxFailedLoginAttempts(int maxFailedLoginAttempts) { this.maxFailedLoginAttempts = maxFailedLoginAttempts; }

    public int getLockoutDurationMinutes() { return lockoutDurationMinutes; }
    public void setLockoutDurationMinutes(int lockoutDurationMinutes) { this.lockoutDurationMinutes = lockoutDurationMinutes; }

    public java.util.List<String> getDefaultCustomPermissions() { return defaultCustomPermissions; }
    public void setDefaultCustomPermissions(java.util.List<String> defaultCustomPermissions) { this.defaultCustomPermissions = defaultCustomPermissions; }
}