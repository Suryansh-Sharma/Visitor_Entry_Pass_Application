package com.suryansh.visitorentry.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * This model class is used by an admin to create a new user account directly
 * (no OTP/email verification — the account is active immediately).
 */
@Data
public class CreateUserModel {
    @NotBlank(message = "name can't be blank")
    private String username;
    @NotBlank(message = "password can't be blank")
    private String password;
    private String contact;
    @NotBlank(message = "role can't be blank")
    private String role;
}
