package com.suryansh.visitorentry.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * This is MongoDb document class that stores user in a database.
 * This is mainly used for login, signUp activities.
 */
@Document("User_Document")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDocument {
    @Id
    private String id;
    private String username;
    private String password;
    private String contact;
    private ROLE role;
    private boolean isActive;
    private boolean isVerified;
    private Verification verification;
    private ForgetPassword forgetPassword;
    private List<RefreshToken> refreshTokens;

    public enum ROLE {
        USER,
        ADMIN,
        RECEPTIONIST,
        TEACHER,
        EXTRA
    }

    @Data
    public static class Verification {
        private int OTP;
        private Instant generatedOn;
    }

    @Data
    @AllArgsConstructor
    public static class ForgetPassword {
        private String UUID;
        private Instant generatedOn;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RefreshToken {
        private String token;
        private Instant generatedOn;
        private Instant expiresOn;
    }

}
