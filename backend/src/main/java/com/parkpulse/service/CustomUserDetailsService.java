package com.parkpulse.service;

import com.parkpulse.model.User;
import com.parkpulse.member.model.Member;
import com.parkpulse.staff.model.Staff;
import com.parkpulse.member.repository.SpringDataMemberRepository;
import com.parkpulse.staff.repository.SpringDataStaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserService userService;

    @Autowired
    private SpringDataMemberRepository memberRepository;

    @Autowired
    private SpringDataStaffRepository staffRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find User (Admin)
        User user = userService.findByUsername(username).orElse(null);
        if (user != null) {
            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
            );
        }

        // Try to find Staff
        Staff staff = staffRepository.findByUsername(username).orElse(null);
        if (staff != null) {
            return new org.springframework.security.core.userdetails.User(
                    staff.getUsername(),
                    staff.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + staff.getAccess().toUpperCase()))
            );
        }

        // Try to find Member
        Member member = memberRepository.findByUsername(username).orElse(null);
        if (member != null) {
            return new org.springframework.security.core.userdetails.User(
                    member.getUsername(),
                    member.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_MEMBER"))
            );
        }

        throw new UsernameNotFoundException("User not found with username: " + username);
    }
}