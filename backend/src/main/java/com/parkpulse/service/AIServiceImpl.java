package com.parkpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class AIServiceImpl implements AIService {

    private static final Logger log = LoggerFactory.getLogger(AIServiceImpl.class);

    @Value("${ai.endpoint}")
    private String endpoint;

    @Value("${ai.model}")
    private String model;

    @Value("${ai.api.key}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    @PostConstruct
    void init() {
        log.info("AI endpoint: {}", endpoint);
        log.info("AI model: {}", model);
        log.info("AI API key loaded: {} ({} chars)",
            apiKey != null && !apiKey.isBlank() ? "yes" : "NO",
            apiKey != null ? apiKey.length() : 0);
    }

    @Override
    public String askAI(String systemPrompt, String contextData, String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("AI API key is not configured.");
        }

        String fullPrompt = systemPrompt + "\n\n---\n" + contextData + "\n---\n\nUser: " + userMessage;

        try {
            Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", fullPrompt))
            );

            String json = mapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("AI API returned status " + response.statusCode()
                    + " (" + response.body() + ")");
            }

            JsonNode root = mapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                String text = choices.get(0).path("message").path("content").asText(null);
                if (text != null) return text.trim();
            }

            throw new RuntimeException("AI API returned an empty or blocked response.");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to communicate with AI API: " + e.getMessage());
        }
    }
}
