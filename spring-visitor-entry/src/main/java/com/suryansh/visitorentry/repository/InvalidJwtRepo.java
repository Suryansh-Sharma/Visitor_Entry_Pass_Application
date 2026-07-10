package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.InvalidJwtEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface InvalidJwtRepo extends JpaRepository<InvalidJwtEntity, String> {
    void deleteByExpiresAtBefore(Instant now);

    Optional<InvalidJwtEntity> findByToken(String token);
}
