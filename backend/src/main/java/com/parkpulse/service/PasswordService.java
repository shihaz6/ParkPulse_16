package com.parkpulse.service;

import com.parkpulse.member.model.Member;
import com.parkpulse.member.repository.SpringDataMemberRepository;
import com.parkpulse.model.User;
import com.parkpulse.staff.model.Staff;
import com.parkpulse.staff.repository.SpringDataStaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PasswordService {

    @Autowired
    private UserService userService;

    @Autowired
    private SpringDataStaffRepository staffRepository;

    @Autowired
    private SpringDataMemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean verifyCurrentPassword(String username, String currentPassword) {
        Optional<User> user = userService.findByUsername(username);
        if (user.isPresent()) {
            return passwordEncoder.matches(currentPassword, user.get().getPassword());
        }
        Optional<Staff> staff = staffRepository.findByUsername(username);
        if (staff.isPresent()) {
            return staff.get().getPassword() != null &&
                   passwordEncoder.matches(currentPassword, staff.get().getPassword());
        }
        Optional<Member> member = memberRepository.findByUsername(username);
        if (member.isPresent()) {
            return member.get().getPassword() != null &&
                   passwordEncoder.matches(currentPassword, member.get().getPassword());
        }
        return false;
    }

    public boolean changePassword(String username, String newPassword) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.updateUser(user);
            return true;
        }
        Optional<Staff> staffOpt = staffRepository.findByUsername(username);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            staff.setPassword(passwordEncoder.encode(newPassword));
            staffRepository.save(staff);
            return true;
        }
        Optional<Member> memberOpt = memberRepository.findByUsername(username);
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            member.setPassword(passwordEncoder.encode(newPassword));
            memberRepository.save(member);
            return true;
        }
        return false;
    }

    public boolean changePasswordForCurrentUser(String currentPassword, String newPassword) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        String username = authentication.getName();
        if (verifyCurrentPassword(username, currentPassword)) {
            return changePassword(username, newPassword);
        }
        return false;
    }
}