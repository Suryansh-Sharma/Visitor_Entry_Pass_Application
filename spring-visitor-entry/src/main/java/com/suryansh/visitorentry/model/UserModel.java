package com.suryansh.visitorentry.model;

import com.suryansh.visitorentry.entity.UserDocument;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
/**
 * This model class is used signUp for user.
 * It performs Jakarta validation also.
 */
@Data
public class UserModel {
    @Pattern(regexp = "^[0-9]{10}$",message = "Contact pattern is wrong")
    private String contact;
    @NotBlank(message = "name can't be blank")
    private String username;
    @NotBlank(message = "password can't be blank")
    private String password;
    @NotBlank(message = "School Role name can't be blank")
    private String role;
}
