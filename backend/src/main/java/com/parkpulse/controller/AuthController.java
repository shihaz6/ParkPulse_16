package com.parkpulse.controller;

import com.parkpulse.dto.AuthResponse;
import com.parkpulse.member.model.Member;
import com.parkpulse.member.repository.SpringDataMemberRepository;
import com.parkpulse.member.service.MemberService;
import com.parkpulse.model.User;
import com.parkpulse.security.JwtUtil;
import com.parkpulse.staff.model.Staff;
import com.parkpulse.service.UserService;
import com.parkpulse.staff.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private StaffService staffService;

    @Autowired
    private MemberService memberService;

    @Autowired
    private SpringDataMemberRepository springDataMemberRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        // 1. Try to login as a primary admin user (from users.txt)
        Optional<User> user = userService.login(username, password);
        if (user.isPresent()) {
            User u = user.get();
            String token = jwtUtil.generateToken(u.getUsername(), "ADMIN", u.getId(), "admin", List.of("*"));
            return ResponseEntity.ok(new AuthResponse(token, u.getUsername(), "ADMIN", "admin", List.of("*")));
        }
        
        // 2. Try to login as a staff member (from staff.txt)
        Optional<Staff> staff = staffService.getAllStaff().stream()
                .filter(s -> s != null && username.equals(s.getUsername()) && passwordEncoder.matches(password, s.getPassword()))
                .findFirst();
                
        if (staff.isPresent()) {
            Staff s = staff.get();
            if (!s.isActive()) {
                return ResponseEntity.status(401).body(Map.of("message", "Your account has been deactivated."));
            }
            String access = s.getAccess();
            List<String> permissions = s.getCustomPermissions();
            if (permissions == null) permissions = List.of();
            String token = jwtUtil.generateToken(s.getUsername(), access.toUpperCase(), s.getId(), access, permissions);
            return ResponseEntity.ok(new AuthResponse(token, s.getUsername(), access.toUpperCase(), access, permissions));
        }

        // 3. Try to login as a member (from members table)
        Optional<Member> member = springDataMemberRepository.findByUsername(username);
        if (member.isPresent()) {
            Member m = member.get();
            if (m.getPassword() == null || !passwordEncoder.matches(password, m.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
            }
            String status = m.getStatus();
            if ("suspended".equalsIgnoreCase(status) || "inactive".equalsIgnoreCase(status)) {
                return ResponseEntity.status(401).body(Map.of("message", "Your account is " + status + "."));
            }
            Map<String, Object> subscription = memberService.calculateSubscription(m);
            String billingCycle = (String) subscription.get("billingCycle");
            String nextRenewalDate = (String) subscription.get("nextRenewalDate");
            long daysRemaining = (long) subscription.get("daysRemaining");

            List<String> memberPerms = List.of("parking-slots", "settings-profile", "settings-password");
            String token = jwtUtil.generateToken(m.getUsername(), "MEMBER", m.getId(), "member", memberPerms);
            return ResponseEntity.ok(new AuthResponse(token, m.getUsername(), "MEMBER", "member", memberPerms,
                    m.getName(), m.getEmail(), m.getPlan(), m.getStatus(), m.getJoinedDate(),
                    m.getVehicles(), billingCycle, nextRenewalDate, daysRemaining));
        }

        // 4. Neither matched
        return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
    }
}
