package com.parkpulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CardValidationRequest {
    
    @NotBlank(message = "Cardholder name is required")
    @Size(min = 2, max = 100, message = "Cardholder name must be between 2 and 100 characters")
    private String holder;
    
    @NotBlank(message = "Card number is required")
    @Pattern(regexp = "^[0-9\\s]{13,19}$", message = "Card number must be 13-19 digits")
    private String number;
    
    @NotBlank(message = "Expiry date is required")
    @Pattern(regexp = "^(0[1-9]|1[0-2])\\/\\d{2}$", message = "Expiry must be in MM/YY format")
    private String expiry;
    
    @NotBlank(message = "CVV is required")
    @Pattern(regexp = "^\\d{3,4}$", message = "CVV must be 3 or 4 digits")
    private String cvv;

    public String getHolder() { return holder; }
    public void setHolder(String holder) { this.holder = holder; }
    
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    
    public String getExpiry() { return expiry; }
    public void setExpiry(String expiry) { this.expiry = expiry; }
    
    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }
}