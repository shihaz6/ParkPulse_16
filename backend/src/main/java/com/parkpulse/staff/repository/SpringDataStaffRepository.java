package com.parkpulse.staff.repository;

import com.parkpulse.staff.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataStaffRepository extends JpaRepository<Staff, String> {
    Optional<Staff> findByUsername(String username);
    Optional<Staff> findByEmail(String email);

    @Query("SELECT DISTINCT s FROM Staff s LEFT JOIN FETCH s.customPermissions")
    List<Staff> findAllWithCustomPermissions();
}
