package com.suryansh.visitorentry.service.interfaces;

import com.suryansh.visitorentry.entity.TelegramIdEntity;
import com.suryansh.visitorentry.entity.UsersEntity;

import java.time.Instant;
import java.util.List;

public interface CacheService {
    List<TelegramIdEntity> getAllTelegramIdFromCache();

    UsersEntity FetchUser(String userId);

    boolean isTokenInvalid(String token);

    boolean addInvalidJwt(String jwtToken, Instant expiration);
}
