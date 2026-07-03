package com.parkpulse.exception;

/**
 * Exception thrown when file storage operations fail.
 */
public class DataStorageException extends ParkPulseException {
    public DataStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
