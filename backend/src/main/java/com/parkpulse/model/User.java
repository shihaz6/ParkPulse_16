package com.parkpulse.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User extends AbstractEntity {
    private String username;
    private String password;
    private String fullName;
    private String email;

    public User() {
        super();
    }

    public User(String id, String username, String password, String fullName, String email) {
        super(id);
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @Override
    public String toDataString() {
        return String.join("|", id, username, password, fullName, email);
    }

    @Override
    public String toString() {
        return toDataString();
    }

    public static User fromString(String line) {
        String[] parts = line.split("\\|");
        if (parts.length < 5) return null;
        return new User(parts[0], parts[1], parts[2], parts[3], parts[4]);
    }
}
