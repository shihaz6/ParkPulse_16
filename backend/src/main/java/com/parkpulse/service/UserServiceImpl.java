package com.parkpulse.service;

import com.parkpulse.model.User;
import com.parkpulse.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        List<User> users = userRepository.findAll();
        boolean updated = false;
        List<User> updatedUsers = new ArrayList<>();

        if (users.isEmpty()) {
            User admin = new User("1", "admin", passwordEncoder.encode("admin123"), "System Administrator", "admin@parkpulse.com");
            updatedUsers.add(admin);
            updated = true;
        } else {
            for (User u : users) {
                if (u != null) {
                    if (!isBCryptHash(u.getPassword())) {
                        u.setPassword(passwordEncoder.encode(u.getPassword()));
                        updated = true;
                    }
                    updatedUsers.add(u);
                }
            }
        }

        if (updated) {
            userRepository.saveAll(updatedUsers);
        }
    }

    private boolean isBCryptHash(String password) {
        return password != null && (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }

    @Override
    public Optional<User> login(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()));
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public void updateUser(User user) {
        userRepository.save(user);
    }
}
