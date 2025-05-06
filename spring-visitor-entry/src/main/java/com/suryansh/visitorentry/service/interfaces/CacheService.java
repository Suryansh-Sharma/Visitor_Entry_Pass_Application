package com.suryansh.visitorentry.service.interfaces;

import com.suryansh.visitorentry.entity.TelegramIdDocument;
import com.suryansh.visitorentry.entity.UserDocument;

import java.time.Instant;
import java.util.List;

public interface CacheService {
    List<TelegramIdDocument> getAllTelegramIdFromCache();

    UserDocument FetchUser(String userId);

    boolean isTokenInvalid(String token);

    boolean addInvalidJwt(String jwtToken, Instant expiration);
}
