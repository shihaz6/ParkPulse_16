package com.parkpulse.dto;

public class ProfileDTO {
    private String id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private String role;
    private String type; // USER, STAFF, or MEMBER

    public ProfileDTO() {
    }

    public ProfileDTO(String id, String username, String name, String email, String phone, String avatar, String role, String type) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.avatar = avatar;
        this.role = role;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}