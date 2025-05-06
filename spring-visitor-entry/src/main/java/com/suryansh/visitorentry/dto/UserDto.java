package com.suryansh.visitorentry.dto;

import java.time.Instant;

/**
 * This java record class is used for user operations.
 * Currently, It acts as DTO for user login,sign-up.
 *
 * @param username   It includes info about username
 * @param password   It includes password.
 * @param role       It includes info about a role e.g.: Teacher, Receptionist etc
 * @param contact    It contains contact number of user.
 * @param isVerified It tells a whether a user account is valid or not.
 */
public record UserDto(
        String id,
        String username,
        String password,
        String role,
        String contact,
        boolean isActive,
        boolean isVerified,
        Credentials credentials) {
    public record Credentials(JWTToken jwtToken,RefreshToken refreshToken) {}
    public record RefreshToken(String token, Instant generatedOn,Instant expiresOn){}
    public record JWTToken(String token,String validity){}
}
