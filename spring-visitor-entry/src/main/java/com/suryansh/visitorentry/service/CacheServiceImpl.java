package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.entity.InvalidJwt;
import com.suryansh.visitorentry.entity.TelegramIdDocument;
import com.suryansh.visitorentry.entity.UserDocument;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.repository.InvalidJwtRepo;
import com.suryansh.visitorentry.repository.TelegramIdRepository;
import com.suryansh.visitorentry.repository.UserRepository;
import com.suryansh.visitorentry.service.interfaces.CacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CacheServiceImpl implements CacheService {
    private static final Logger logger = LoggerFactory.getLogger(CacheServiceImpl.class);
    private final TelegramIdRepository telegramIdRepository;
    private final UserRepository userRepository;
    private final InvalidJwtRepo invalidJwtRepo;

    public CacheServiceImpl(TelegramIdRepository telegramIdRepository, UserRepository userRepository, InvalidJwtRepo invalidJwtRepo) {
        this.telegramIdRepository = telegramIdRepository;
        this.userRepository = userRepository;
        this.invalidJwtRepo = invalidJwtRepo;
    }

    @Override
    @Cacheable(value = "telegramIdDocument", key = "'allTelegramIds'")
    public List<TelegramIdDocument> getAllTelegramIdFromCache() {
        return telegramIdRepository.findAll();
    }

    @Override
    @Cacheable(value = "user_doc",key = "#userId")
    public UserDocument FetchUser(String userId){
        return userRepository.findById(userId)
                .orElseThrow(
                        ()->new SpringVisitorException("Invalid Credentials ", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
    }

    @Override
    @Cacheable(value = "blacklistedTokens", key = "#token")
    public boolean isTokenInvalid(String token) {
        Optional<InvalidJwt> invalidJwt = invalidJwtRepo.findByToken(token);
        return invalidJwt.isPresent();
    }

    @CachePut(value = "blacklistedTokens", key = "#token")
    @Override
    public boolean addInvalidJwt(String token,Instant expiredAt) {
        InvalidJwt invalidJwt = new InvalidJwt();
        invalidJwt.setExpiresAt(expiredAt);
        invalidJwt.setToken(token);
        try {
            invalidJwtRepo.save(invalidJwt);
            return true;
        }catch (Exception e){
            logger.error("Unable to add invalid jwt {} ",e.getMessage());
            return false;
        }
    }

    @CacheEvict(value = "blacklistedTokens",allEntries = true)
    @Scheduled(fixedRate = 3600000)
    public void removeALLExpiredToken(){
        Instant now =ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toInstant();
        try {
            invalidJwtRepo.deleteByExpiresAtBefore(now);
            logger.info("Removing all expired tokens");
        }catch (Exception e){
            logger.error("Unable to remove expired jwt {}",e.getMessage());
        }
    }


}
