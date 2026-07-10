package com.suryansh.visitorentry.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "invalid_jwt")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvalidJwtEntity {
    @Id
    @UuidGenerator
    private String id;
    private String token;
    private Instant expiresAt;
}
