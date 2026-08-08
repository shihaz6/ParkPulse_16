package com.parkpulse.staff.service;

import com.parkpulse.staff.model.Staff;
import com.parkpulse.staff.repository.StaffRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

@Service
public class StaffServiceImpl implements StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${storage.path:data}")
    private String storagePath;

    @PostConstruct
    public void init() {
        File uploadDir = new File(storagePath, "uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        // No default staff — admin must create staff via Staff Management
    }

    private boolean isBCryptHash(String password) {
        return password != null && (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }

    @Override
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    @Override
    public void saveStaff(Staff s) {
        if (s.getPassword() != null && !s.getPassword().isEmpty() && !isBCryptHash(s.getPassword())) {
            s.setPassword(passwordEncoder.encode(s.getPassword()));
        }
        
        Optional<Staff> existing = staffRepository.findById(s.getId());
        if (existing.isPresent()) {
            if (s.getPassword() == null || s.getPassword().isEmpty()) {
                s.setPassword(existing.get().getPassword());
            }
        }
        
        staffRepository.save(s);
    }

    @Override
    public Staff saveStaffWithImage(Staff staff, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                String fileName = java.util.UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                Path path = Paths.get(storagePath, "uploads", fileName);
                Files.createDirectories(path.getParent());
                Files.copy(image.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                staff.setAvatar("/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Could not save image file", e);
            }
        }
        saveStaff(staff);
        return staff;
    }

    @Override
    public void deleteStaff(String id) {
        staffRepository.deleteById(id);
    }

    @Override
    public Optional<Staff> getStaffById(String id) {
        return staffRepository.findById(id);
    }
}
