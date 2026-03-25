package com.sprintmanagement.authservice.exception;

public class ProfileSyncException extends RuntimeException {

    public ProfileSyncException(String email, Throwable cause) {
        super("Failed to synchronize user profile for email: " + email, cause);
    }
}
