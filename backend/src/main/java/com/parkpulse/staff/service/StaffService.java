package com.parkpulse.staff.service;

import com.parkpulse.staff.model.Staff;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;

public interface StaffService {
    List<Staff> getAllStaff();
    void saveStaff(Staff s);
    Staff saveStaffWithImage(Staff staff, MultipartFile image);
    void deleteStaff(String id);
    Optional<Staff> getStaffById(String id);
}
