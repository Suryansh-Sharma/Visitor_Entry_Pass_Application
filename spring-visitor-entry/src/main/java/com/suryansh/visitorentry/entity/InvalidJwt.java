package com.suryansh.visitorentry.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document
@Data
public class InvalidJwt {
    @Id
    private String id;
    private String token;
    private Instant expiresAt;
}
