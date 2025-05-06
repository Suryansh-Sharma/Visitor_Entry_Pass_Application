package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.dto.UserDto;
import com.suryansh.visitorentry.entity.UserDocument;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.model.UserModel;
import com.suryansh.visitorentry.repository.UserRepository;
import com.suryansh.visitorentry.security.JwtService;
import com.suryansh.visitorentry.service.interfaces.CacheService;
import com.suryansh.visitorentry.service.interfaces.TelegramService;
import com.suryansh.visitorentry.service.interfaces.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * This class is used for performing user authentication operation.
 *
 * @author suryansh
 */
@Service
public class UserServiceImpl implements UserService {
    private static final long OTP_EXPIRATION_MINUTES = 30;  // 30 minutes for expiration
    private final UserRepository userRepository;
    private final TelegramService telegramService;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final CacheService cacheService;

    @Value("${expiration_time}")
    private long EXPIRE_TIME;

    public UserServiceImpl(UserRepository userRepository, TelegramService telegramService,
                           JwtService jwtService, PasswordEncoder passwordEncoder, CacheService cacheService) {
        this.userRepository = userRepository;
        this.telegramService = telegramService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.cacheService = cacheService;
    }

    @Override
    @Async
    public CompletableFuture<UserDto> addNewUser(UserModel model) {
        return CompletableFuture.supplyAsync(() -> {
            // Check if the user already exists
            Optional<UserDocument> checkDocument = userRepository.findByUsername(model.getUsername());
            if (checkDocument.isPresent()) {
                throw new SpringVisitorException("Username " + model.getUsername() + " is already present !!",
                        ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
            UserDocument.Verification verification = new UserDocument.Verification();
            verification.setGeneratedOn(Instant.now());
            verification.setOTP(generateSixDigitNumber());
            // Create a new user document
            UserDocument userDocument = UserDocument.builder()
                    .contact(model.getContact())
                    .username(model.getUsername())
                    .password(passwordEncoder.encode(model.getPassword())) // Consider hashing passwords before saving
                    .role(UserDocument.ROLE.valueOf(model.getRole().toUpperCase()))
                    .isActive(false)
                    .isVerified(false)
                    .verification(verification) // Generate OTP
                    .refreshTokens(new ArrayList<>())
                    .build();
            ZonedDateTime nowInIndia = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
            UserDocument.RefreshToken refreshToken = new UserDocument.RefreshToken(
                    UUID.randomUUID().toString(),
                    nowInIndia.toInstant(),
                    nowInIndia.plusDays(1).toInstant()
            );
            userDocument.getRefreshTokens().add(refreshToken);
            try {
                // Save user to the repository
                UserDocument user = userRepository.save(userDocument);

                // Prepare the message to be sent to admins
                String message = String.format("%s created a new account! Here is the OTP: %s",
                        model.getUsername(), userDocument.getVerification().getOTP());

                // Send OTP notification to admins via Telegram
                telegramService.sendMsgToADMIN(message);

                // Log success
                logger.info("New user '{}' added successfully and OTP sent to admins", model.getUsername());

                // Prepare claims with role
                HashMap<String, Object> claims = new HashMap<>();
                claims.put("role", user.getRole().name());
                String token = jwtService.generateToken(user.getId(), claims);
                return new UserDto(
                        user.getId(),
                        user.getUsername(),
                        null,
                        user.getRole().name(),
                        user.getContact(),
                        user.isActive(),
                        user.isVerified(),
                        new UserDto.Credentials(
                                new UserDto.JWTToken(token,
                                        "Token will expire in " + EXPIRE_TIME + " minutes"),
                                new UserDto.RefreshToken(refreshToken.getToken(), refreshToken.getGeneratedOn(), refreshToken.getExpiresOn())
                        )
                );
            } catch (Exception e) {
                // Log the error
                logger.error("Unable to add new user: {} - {}", model.getUsername(), e.getMessage());

                // Throw a custom exception for the failure
                throw new SpringVisitorException("Sorry, unable to add new user",
                        ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        });
    }


    @Override
    public UserDto loginUser(String username, String password) {
        // Step 1: Retrieve user by username
        UserDocument checkDocument = userRepository.findByUsername(username)
                .orElseThrow(() -> new SpringVisitorException(
                        "Invalid Username", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));

//         Step 2: Verify the password
        if (!passwordEncoder.matches(password, checkDocument.getPassword())) {
            throw new SpringVisitorException(
                    "Invalid Password", ErrorType.BAD_REQUEST, HttpStatus.UNAUTHORIZED);
        }

        // Prepare claims with role
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", checkDocument.getRole().name());
        String token = jwtService.generateToken(checkDocument.getId(), claims); // Use user ID as subject.

        // Generate new refresh token
        ZonedDateTime nowInIndia = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
        UserDocument.RefreshToken refreshToken = new UserDocument.RefreshToken(
                UUID.randomUUID().toString(),
                nowInIndia.toInstant(),
                nowInIndia.plusDays(1).toInstant() // Expires in 1 day
        );
        if (checkDocument.getRefreshTokens() != null) {
            // Remove Old ExpiredToken
            checkDocument.getRefreshTokens()
                    .removeIf(r -> nowInIndia.toInstant().isAfter(r.getExpiresOn()));
        } else {
            checkDocument.setRefreshTokens(new ArrayList<>());
        }
        checkDocument.getRefreshTokens().add(refreshToken);
        try {
            userRepository.save(checkDocument);
            return new UserDto(
                    checkDocument.getId(),
                    checkDocument.getUsername(),
                    null,
                    checkDocument.getRole().name(),
                    checkDocument.getContact(),
                    checkDocument.isActive(),
                    checkDocument.isVerified(),
                    new UserDto.Credentials(
                            new UserDto.JWTToken(token,
                                    "Token will expire in " + EXPIRE_TIME + " minutes"),
                            new UserDto.RefreshToken(refreshToken.getToken(), refreshToken.getGeneratedOn(), refreshToken.getExpiresOn())
                    )
            );
        } catch (Exception e) {
            logger.error("Unable to login user: {} - {}", checkDocument.getId(), e.getMessage());
            throw new SpringVisitorException(
                    "Unable to login !!", ErrorType.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @Override
    public String verifyUserAccount(int otp, String userId) {
        UserDocument userDoc = userRepository.findById(userId)
                .orElseThrow(() -> new SpringVisitorException("Invalid User Id ", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
        if (userDoc.isVerified()) {
            return "User is already verified";
        }
        if (userDoc.getVerification().getOTP() != otp) {
            throw new SpringVisitorException("Invalid OTP ", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }

        if (isOtpExpired(userDoc.getVerification().getGeneratedOn())) {
            throw new SpringVisitorException("Sorry this otp is expired !!", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        userDoc.setVerified(true);
        userDoc.setActive(true);
        userDoc.setVerification(null);
        try {
            userRepository.save(userDoc);
            return "Otp verified successfully !!";
        } catch (Exception e) {
            // Log the error
            logger.error("Unable to verify user: {} - {}", userDoc.getUsername(), e.getMessage());
            // Throw a custom exception for the failure
            throw new SpringVisitorException("Sorry, unable to verify otp for user",
                    ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Async
    public CompletableFuture<String> regeneratedOtpForUser(String userId) {
        return CompletableFuture.supplyAsync(() -> {
            UserDocument userDoc = userRepository.findById(userId)
                    .orElseThrow(() -> new SpringVisitorException("Invalid Credentials ", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
            if (userDoc.isVerified()) {
                throw new SpringVisitorException("User already verified", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
            if (userDoc.getVerification() != null && !isOtpExpired(userDoc.getVerification().getGeneratedOn())) {
                throw new SpringVisitorException("Otp is already sent to User", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);

            }
            UserDocument.Verification verification = new UserDocument.Verification();
            verification.setGeneratedOn(Instant.now());
            verification.setOTP(generateSixDigitNumber());
            userDoc.setVerification(verification);
            try {
                userRepository.save(userDoc);
                // Prepare the message to be sent to admins
                String message = String.format("%s regenerated OTP! Here is the OTP: %s",
                        userDoc.getUsername(), userDoc.getVerification().getOTP());
                telegramService.sendMsgToADMIN(message);
                return "Otp resented successfully !!";
            } catch (Exception e) {
                // Log the error
                logger.error("Unable to send otp for user: {} - {}", userDoc.getUsername(), e.getMessage());
                // Throw a custom exception for the failure
                throw new SpringVisitorException("Sorry, to send otp for user",
                        ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        });
    }

    @Override
    public CompletableFuture<String> handleForgetPassword(String username) {
        return CompletableFuture.supplyAsync(() -> {
            UserDocument userDoc = userRepository.findByUsername(username)
                    .orElseThrow(() -> new SpringVisitorException("Username not found", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
            try {

                userDoc.setForgetPassword(new UserDocument.ForgetPassword(
                        UUID.randomUUID().toString(),
                        Instant.now()
                ));
                userRepository.save(userDoc);
                final String message = getString(username, userDoc);

//                 Send OTP notification to admins via Telegram
                telegramService.sendMsgToADMIN(message);

                return "A Link is sent to ADMIN, use that link in this machine to change password";
            } catch (Exception e) {
                logger.error("Unable to send forget password to user : {} - {}", username, e.getMessage());
                throw new SpringVisitorException("Unable to send forget password to user", ErrorType.BAD_REQUEST
                        , HttpStatus.BAD_REQUEST);
            }
        });
    }

    private static String getString(String username, UserDocument userDoc) {
        String url = String.format("http://localhost:8080/api/auth/reset-password/for-user/%s/token/%s", username, userDoc.getForgetPassword().getUUID());
        logger.info("URL is: {}", url);
        // Prepare the message to be sent to admins
        return String.format(
                """
                📢 <b>Password Reset Request</b>
                
                👤 <b>User:</b> %s
                🔗 <b>Reset Link:- </b> <a href="%s">%s</a>
                
                ⚠️ <i>Note:</i> This link is valid for <b>30 minutes</b>. Please ensure the user opens it in their browser.
                
                Thank you, 🙏
                — <i>Suryansh Sharma</i>
                """,
                userDoc.getUsername(), url, url
        );


    }

    @Override
    public UserDto.Credentials getJwtFromRefToken(String refreshToken) {
        UserDocument userDoc = userRepository.findByRefreshTokensToken(refreshToken)
                .orElseThrow(() -> new SpringVisitorException("Refresh token is Invalid !!", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
        // Find the refresh token from the list of tokens
        UserDocument.RefreshToken rft = userDoc.getRefreshTokens()
                .stream()
                .filter(r -> r.getToken().equals(refreshToken))
                .findFirst()
                .orElseThrow(() -> new SpringVisitorException("Refresh token not found in user's tokens.", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
        ZonedDateTime nowInIndia = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));

        // Check if the refresh token is expired
        if (rft.getExpiresOn().isBefore(nowInIndia.toInstant())) {
            throw new SpringVisitorException("Refresh token is expired, Please generate a new one", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST);
        }

        // Prepare claims with role
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDoc.getRole().name());

        String token = jwtService.generateToken(userDoc.getId(), claims);
        return new UserDto.Credentials(
                new UserDto.JWTToken(token,
                        "Token will expire in " + EXPIRE_TIME + " minutes"),
                new UserDto.RefreshToken(rft.getToken(), rft.getGeneratedOn(), rft.getExpiresOn())
        );
    }

    @Override
    public String logoutUser(String useId, String refreshToken, Instant expiration, String jwtToken) {
        UserDocument userDoc = cacheService.FetchUser(useId);
        // Remove the refresh token from the user's list of refresh tokens
        boolean isTokenRemoved = userDoc.getRefreshTokens()
                .removeIf(r -> r.getToken().equals(refreshToken));
        // If the refresh token is not found, throw an exception
        if (!isTokenRemoved) {
            throw new SpringVisitorException("Refresh token not found in user's tokens.", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST);
        }
        try {
            // Add the JWT token to the blacklist (invalidate it)
            boolean isTokenBlackListed = cacheService.addInvalidJwt(jwtToken, expiration);
            // If the token was blacklisted successfully, save the user document
            if (isTokenBlackListed) {
                userRepository.save(userDoc); // Save the updated user document
            }
            return "Successfully logged out";
        } catch (Exception e) {
            logger.error("Unable to logout user: {} - {}", userDoc.getUsername(), e.getMessage());
            throw new SpringVisitorException("Unable to logout !!", ErrorType.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    private boolean isOtpExpired(Instant generatedOn) {
        return Duration.between(generatedOn, Instant.now()).toMinutes() >= OTP_EXPIRATION_MINUTES;
    }

    public int generateSixDigitNumber() {
        Random random = new Random();
        return 100000 + random.nextInt(900000);
    }
}
