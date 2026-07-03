package com.parkpulse.service;

import com.parkpulse.model.User;
import java.util.Optional;

public interface UserService {
    Optional<User> login(String username, String password);
    Optional<User> findByUsername(String username);
    void updateUser(User user);
}