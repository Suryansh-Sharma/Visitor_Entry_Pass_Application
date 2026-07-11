package com.suryansh.visitorentry.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsersEntity {
    @Id
    @UuidGenerator
    private String id;
    private String username;
    @Column(nullable = false)
    private String password;
    private String contact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ROLE role;

    private boolean isActive;
    private boolean isVerified;

    @Embedded
    private Verification verification;
    @Embedded
    private ForgetPassword forgetPassword;
    @Embedded
    private RefreshToken refreshToken;

    public enum ROLE {
        MANAGER,
        USER,
        ADMIN,
        RECEPTIONIST,
        TEACHER,
        EXTRA
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Verification {
        @Column(name = "verification_otp")
        private Integer otp;
        @Column(name = "verification_generated_on")
        private Instant generatedOn;
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForgetPassword {
        @Column(name = "forget_password_uuid")
        private String uuid;
        @Column(name = "forget_password_generated_on")
        private Instant generatedOn;
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshToken {
        @Column(name = "refresh_token")
        private String token;
        @Column(name = "refresh_token_generated_on")
        private Instant generatedOn;
        @Column(name = "refresh_token_expires_on")
        private Instant expiresOn;
    }
}