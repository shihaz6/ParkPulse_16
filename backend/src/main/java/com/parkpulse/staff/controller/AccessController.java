package com.parkpulse.staff.controller;

import com.parkpulse.staff.dto.StaffDTO;
import com.parkpulse.staff.model.Staff;
import com.parkpulse.staff.service.StaffService;
import com.parkpulse.util.DtoMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
public class AccessController {

    @Autowired
    private StaffService staffService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping
    public List<StaffDTO> getAllStaff() {
        return staffService.getAllStaff().stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<StaffDTO> saveStaff(@Valid @RequestBody StaffDTO staffDTO) {
        Staff staff = DtoMapper.toEntity(staffDTO);
        staffService.saveStaff(staff);
        return ResponseEntity.ok(DtoMapper.toDto(staff));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<StaffDTO> saveStaffWithImage(
            @ModelAttribute StaffDTO staffDTO,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        Staff staff = DtoMapper.toEntity(staffDTO);
        staffService.saveStaffWithImage(staff, image);
        return ResponseEntity.ok(DtoMapper.toDto(staff));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffDTO> updateStaff(@PathVariable String id, @Valid @RequestBody StaffDTO staffDTO) {
        Staff staff = DtoMapper.toEntity(staffDTO);
        staff.setId(id);
        staffService.saveStaff(staff);
        return ResponseEntity.ok(DtoMapper.toDto(staff));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<StaffDTO> updateStaffWithImage(
            @PathVariable String id,
            @ModelAttribute StaffDTO staffDTO,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        return staffService.getStaffById(id)
                .map(existingStaff -> {
                    Staff staff = DtoMapper.toEntity(staffDTO);
                    staff.setId(id);
                    if ((image == null || image.isEmpty()) && existingStaff.getAvatar() != null) {
                        staff.setAvatar(existingStaff.getAvatar());
                    }
                    staffService.saveStaffWithImage(staff, image);
                    return ResponseEntity.ok(DtoMapper.toDto(staff));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable String id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffDTO> getStaff(@PathVariable String id) {
        return staffService.getStaffById(id)
                .map(DtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        
        Optional<Staff> staffOpt = staffService.getAllStaff().stream()
                .filter(s -> s.getUsername().equals(username) && passwordEncoder.matches(password, s.getPassword()))
                .findFirst();
                
        if (staffOpt.isPresent()) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect current password"));
        }
    }
    
    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String newPassword = request.get("newPassword");
        
        Optional<Staff> staffOpt = staffService.getAllStaff().stream()
                .filter(s -> s.getUsername().equals(username))
                .findFirst();
                
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            staff.setPassword(newPassword);
            staffService.saveStaff(staff);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
    }
}
