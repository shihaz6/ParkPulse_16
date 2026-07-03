package com.parkpulse.service;

public interface ChatService {
    String processMessage(String message, String username, String role, String userId);
}
