package com.parkpulse.exception;

/**
 * Base exception for all ParkPulse related errors.
 * Demonstrates Inheritance and Exception Handling.
 */
public class ParkPulseException extends RuntimeException {
    public ParkPulseException(String message) {
        super(message);
    }

    public ParkPulseException(String message, Throwable cause) {
        super(message, cause);
    }
}
