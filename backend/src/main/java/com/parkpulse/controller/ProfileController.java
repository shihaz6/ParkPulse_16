package com.parkpulse.controller;

import com.parkpulse.dto.ProfileDTO;
import com.parkpulse.member.model.Member;
import com.parkpulse.member.repository.SpringDataMemberRepository;
import com.parkpulse.model.User;
import com.parkpulse.service.UserService;
import com.parkpulse.staff.model.Staff;
import com.parkpulse.staff.repository.SpringDataStaffRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    @Autowired
    private SpringDataStaffRepository staffRepository;

    @Autowired
    private SpringDataMemberRepository memberRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    // Helper method to get username from Authorization header
    private String getUsernameFromAuth(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // Try to parse JWT token
                if (token.contains(".") && !token.startsWith("mock_token")) {
                    Claims claims = Jwts.parserBuilder()
                            .setSigningKey(jwtSecret.getBytes())
                            .build()
                            .parseClaimsJws(token)
                            .getBody();
                    return claims.getSubject();
                } else {
                    // Mock token - try to extract username from a known format or default to admin
                    // For now return admin since mock tokens are used during development
                    return "admin";
                }
            } catch (Exception e) {
                // Token parsing failed
                return "admin";
            }
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<ProfileDTO> getCurrentProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String username = getUsernameFromAuth(authHeader);
        if (username == null) {
            // Fallback to admin user for development
            username = "admin";
        }

        // Try User first (Admin)
        User user = userService.findByUsername(username).orElse(null);
        if (user != null) {
            ProfileDTO profile = new ProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                null,
                null,
                "Admin",
                "USER"
            );
            return ResponseEntity.ok(profile);
        }

        // Try Staff
        Staff staff = staffRepository.findByUsername(username).orElse(null);
        if (staff != null) {
            ProfileDTO profile = new ProfileDTO(
                staff.getId(),
                staff.getUsername(),
                staff.getName(),
                staff.getEmail(),
                staff.getPhone(),
                staff.getAvatar(),
                staff.getAccess() != null ? staff.getAccess() : "Operator",
                "STAFF"
            );
            return ResponseEntity.ok(profile);
        }

        // Try Member
        Member member = memberRepository.findByUsername(username).orElse(null);
        if (member != null) {
            ProfileDTO profile = new ProfileDTO(
                member.getId(),
                member.getUsername(),
                member.getName(),
                member.getEmail(),
                member.getPhone(),
                null,
                "Member",
                "MEMBER"
            );
            return ResponseEntity.ok(profile);
        }

        // Fallback: return default admin profile
        ProfileDTO defaultProfile = new ProfileDTO(
                "1",
                "admin",
                "System Administrator",
                "admin@parkpulse.com",
                null,
                null,
                "Admin",
                "USER"
        );
        return ResponseEntity.ok(defaultProfile);
    }

    @PutMapping
    public ResponseEntity<ProfileDTO> updateProfile(
            @RequestBody ProfileDTO updatedProfile,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String username = getUsernameFromAuth(authHeader);
        if (username == null) {
            username = "admin";
        }

        // Update User (Admin)
        User user = userService.findByUsername(username).orElse(null);
        if (user != null) {
            user.setFullName(updatedProfile.getName());
            user.setEmail(updatedProfile.getEmail());
            userService.updateUser(user);
            ProfileDTO profile = new ProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                updatedProfile.getPhone(),
                updatedProfile.getAvatar(),
                "Admin",
                "USER"
            );
            return ResponseEntity.ok(profile);
        }

        // Update Staff
        Staff staff = staffRepository.findByUsername(username).orElse(null);
        if (staff != null) {
            staff.setName(updatedProfile.getName());
            staff.setEmail(updatedProfile.getEmail());
            staff.setPhone(updatedProfile.getPhone());
            if (updatedProfile.getAvatar() != null) {
                staff.setAvatar(updatedProfile.getAvatar());
            }
            staffRepository.save(staff);
            ProfileDTO profile = new ProfileDTO(
                staff.getId(),
                staff.getUsername(),
                staff.getName(),
                staff.getEmail(),
                staff.getPhone(),
                staff.getAvatar(),
                staff.getAccess() != null ? staff.getAccess() : "Operator",
                "STAFF"
            );
            return ResponseEntity.ok(profile);
        }

        // Update Member
        Member member = memberRepository.findByUsername(username).orElse(null);
        if (member != null) {
            member.setName(updatedProfile.getName());
            member.setEmail(updatedProfile.getEmail());
            member.setPhone(updatedProfile.getPhone());
            memberRepository.save(member);
            ProfileDTO profile = new ProfileDTO(
                member.getId(),
                member.getUsername(),
                member.getName(),
                member.getEmail(),
                member.getPhone(),
                updatedProfile.getAvatar(),
                "Member",
                "MEMBER"
            );
            return ResponseEntity.ok(profile);
        }

        // Return default response if user not found
        return ResponseEntity.ok(updatedProfile);
    }
}