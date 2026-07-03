package com.parkpulse.staff.repository;

import com.parkpulse.staff.model.Staff;
import java.util.List;
import java.util.Optional;

public interface StaffRepository {
    List<Staff> findAll();
    Optional<Staff> findById(String id);
    Staff save(Staff staff);
    void deleteById(String id);
    void saveAll(List<Staff> staffList);
    void syncAccessLevels(List<Staff> staffList);
}
