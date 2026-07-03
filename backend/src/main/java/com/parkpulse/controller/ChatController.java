package com.parkpulse.controller;

import com.parkpulse.security.JwtUtil;
import com.parkpulse.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatService chatService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("reply", "Authentication required."));
        }

        String token = authHeader.substring(7);
        String message = body.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("reply", "Message is required."));
        }

        String username = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        String userId = jwtUtil.extractUserId(token);

        try {
            String reply = chatService.processMessage(message.trim(), username, role, userId);
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception e) {
            log.error("Chat error for user {}: {}", username, e.getMessage());
            String userMsg = e.getMessage() != null && e.getMessage().contains("API key is not configured")
                ? "AI API key is not configured. Set AI_API_KEY in .env or environment and restart."
                : "Sorry, the AI service is currently unavailable. Please try again later.";
            return ResponseEntity.ok(Map.of("reply", userMsg));
        }
    }
}
