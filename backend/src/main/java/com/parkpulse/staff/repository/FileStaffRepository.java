package com.parkpulse.staff.repository;

import com.parkpulse.staff.model.Staff;
import com.parkpulse.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Repository
public class FileStaffRepository implements StaffRepository {

    private static final String STAFF_FILE = "staff.txt";
    private static final String ACCESS_LEVEL_FILE = "accesslevel.txt";

    @Autowired
    private FileStorageService fileStorageService;

    @Value("${storage.path:data}")
    private String storagePath;

    @Override
    public List<Staff> findAll() {
        return fileStorageService.loadAll(STAFF_FILE, Staff::fromString).stream()
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Optional<Staff> findById(String id) {
        return findAll().stream()
                .filter(s -> s.getId().equals(id))
                .findFirst();
    }

    @Override
    public Staff save(Staff s) {
        List<Staff> staffList = findAll();
        if (s.getId() == null || s.getId().isEmpty()) {
            s.setId("s" + System.currentTimeMillis());
            staffList.add(s);
        } else {
            boolean found = false;
            for (int i = 0; i < staffList.size(); i++) {
                if (staffList.get(i).getId().equals(s.getId())) {
                    staffList.set(i, s);
                    found = true;
                    break;
                }
            }
            if (!found) {
                staffList.add(s);
            }
        }
        fileStorageService.saveAll(STAFF_FILE, staffList);
        syncAccessLevels(staffList);
        return s;
    }

    @Override
    public void deleteById(String id) {
        List<Staff> staffList = findAll();
        staffList.removeIf(s -> s.getId().equals(id));
        fileStorageService.saveAll(STAFF_FILE, staffList);
        syncAccessLevels(staffList);
    }

    @Override
    public void saveAll(List<Staff> staffList) {
        fileStorageService.saveAll(STAFF_FILE, staffList);
        syncAccessLevels(staffList);
    }

    @Override
    public void syncAccessLevels(List<Staff> staffList) {
        Path path = Paths.get(storagePath, ACCESS_LEVEL_FILE);
        try {
            Files.createDirectories(path.getParent());
            try (BufferedWriter writer = Files.newBufferedWriter(path, StandardCharsets.UTF_8)) {
                for (Staff s : staffList) {
                    writer.write(s.getId() + "|" + s.getUsername() + "|" + s.getAccess());
                    writer.newLine();
                }
            }
        } catch (IOException e) {
            System.err.println("Could not sync access levels: " + e.getMessage());
        }
    }
}
