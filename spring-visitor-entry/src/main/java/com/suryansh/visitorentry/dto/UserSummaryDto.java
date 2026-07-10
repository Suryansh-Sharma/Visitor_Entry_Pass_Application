package com.suryansh.visitorentry.dto;

/**
 * Lightweight user representation for admin user-management screens.
 * Deliberately excludes password/credentials.
 */
public record UserSummaryDto(
        String id,
        String username,
        String contact,
        String role,
        boolean isActive,
        boolean isVerified) {
}
