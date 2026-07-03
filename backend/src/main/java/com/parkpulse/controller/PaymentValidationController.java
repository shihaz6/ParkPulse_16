package com.parkpulse.controller;

import com.parkpulse.dto.CardValidationRequest;
import com.parkpulse.member.repository.SpringDataMemberRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentValidationController {

    @Autowired
    private SpringDataMemberRepository memberRepository;

    @PostMapping("/validate-card")
    public ResponseEntity<?> validateCard(@Valid @RequestBody CardValidationRequest request, BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();

        if (bindingResult.hasErrors()) {
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        // Validate expiry date - not more than 12 months in the future
        try {
            String expiry = request.getExpiry();
            int month = Integer.parseInt(expiry.substring(0, 2));
            int year = Integer.parseInt(expiry.substring(3, 5));
            
            YearMonth expiryDate = YearMonth.of(2000 + year, month);
            YearMonth now = YearMonth.now();
            YearMonth maxFuture = now.plusYears(10);
            
            if (expiryDate.isBefore(now)) {
                errors.put("expiry", "Card has expired");
            } else if (expiryDate.isAfter(maxFuture)) {
                errors.put("expiry", "Expiry date cannot be more than 10 years in the future");
            }
        } catch (Exception e) {
            errors.put("expiry", "Invalid expiry format");
        }

        // Validate card number (Luhn algorithm)
        if (!isValidLuhn(request.getNumber().replaceAll("\\s", ""))) {
            errors.put("number", "Invalid card number");
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        return ResponseEntity.ok(Map.of("valid", true, "message", "Card details are valid"));
    }

    @PostMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        boolean exists = memberRepository.existsByUsername(username);
        
        return ResponseEntity.ok(Map.of(
            "available", !exists,
            "message", exists ? "Username already taken" : "Username available"
        ));
    }

    private boolean isValidLuhn(String number) {
        if (number == null || number.length() < 13 || number.length() > 19) {
            return false;
        }
        
        int sum = 0;
        boolean alternate = false;
        
        for (int i = number.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(number.charAt(i));
            
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            alternate = !alternate;
        }
        
        return sum % 10 == 0;
    }
}