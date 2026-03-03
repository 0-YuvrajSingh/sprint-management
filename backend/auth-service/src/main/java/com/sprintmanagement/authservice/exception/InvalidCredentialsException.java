package com.sprintmanagement.authservice.exception;

/**
 * Thrown when login credentials do not match any user record. Maps to HTTP 401
 * Unauthorized via {@link GlobalExceptionHandler}.
 *
 * <p>
 * Always returns the same generic message regardless of whether the email or
 * password was wrong — avoids leaking which half of the credentials is invalid.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}
