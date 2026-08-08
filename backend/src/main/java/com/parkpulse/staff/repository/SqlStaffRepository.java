package com.parkpulse.staff.repository;

import com.parkpulse.staff.model.Staff;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
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
@Primary
public class SqlStaffRepository implements StaffRepository {

    private static final String ACCESS_LEVEL_FILE = "accesslevel.txt";

    @Autowired
    private SpringDataStaffRepository springDataStaffRepository;

    @Value("${storage.path:data}")
    private String storagePath;

    @Override
    public List<Staff> findAll() {
        return springDataStaffRepository.findAllWithCustomPermissions();
    }

    @Override
    public Optional<Staff> findById(String id) {
        return springDataStaffRepository.findById(id);
    }

    @Override
    public Staff save(Staff staff) {
        Staff saved = springDataStaffRepository.save(staff);
        syncAccessLevels(findAll());
        return saved;
    }

    @Override
    public void deleteById(String id) {
        springDataStaffRepository.deleteById(id);
        syncAccessLevels(findAll());
    }

    @Override
    public void saveAll(List<Staff> staffList) {
        springDataStaffRepository.saveAll(staffList);
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
