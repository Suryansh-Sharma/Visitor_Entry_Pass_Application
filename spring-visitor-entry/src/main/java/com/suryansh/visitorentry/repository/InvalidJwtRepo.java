package com.suryansh.visitorentry.repository;

import com.suryansh.visitorentry.entity.InvalidJwt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.Optional;

public interface InvalidJwtRepo extends MongoRepository<InvalidJwt, String> {
    void deleteByExpiresAtBefore(Instant now);

    Optional<InvalidJwt> findByToken(String token);
}
