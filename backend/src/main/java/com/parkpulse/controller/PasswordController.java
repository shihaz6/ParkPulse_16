package com.parkpulse.controller;

import com.parkpulse.service.PasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordController {

    @Autowired
    private PasswordService passwordService;

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String currentPassword = request.get("password");

        if (username == null) {
            username = "admin"; // Fallback
        }
        if (currentPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }

        boolean valid = passwordService.verifyCurrentPassword(username, currentPassword);
        if (valid) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect current password"));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        // Default to admin if no username provided
        if (username == null || username.trim().isEmpty()) {
            username = "admin";
        }

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password and new password are required"));
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 8 characters"));
        }

        boolean verified = passwordService.verifyCurrentPassword(username, currentPassword);
        if (!verified) {
            return ResponseEntity.status(401).body(Map.of("message", "Current password is incorrect or user not found"));
        }

        boolean success = passwordService.changePassword(username, newPassword);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } else {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to change password"));
        }
    }
}