package com.sprintmanagement.authservice.exception;

/**
 * Thrown when a registration attempt uses an email address already in the
 * database. Maps to HTTP 409 Conflict via {@link GlobalExceptionHandler}.
 */
public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String email) {
        super("Email already registered: " + email);
    }
}
