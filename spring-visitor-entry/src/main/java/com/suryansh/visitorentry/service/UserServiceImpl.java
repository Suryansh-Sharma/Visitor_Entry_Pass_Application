package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.dto.UserDto;
import com.suryansh.visitorentry.dto.UserSummaryDto;
import com.suryansh.visitorentry.entity.UsersEntity;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.model.CreateUserModel;
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
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;
    private final TelegramService telegramService;
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

    private static String getString(String username, UsersEntity userDoc) {
        String url = String.format("http://localhost:8080/api/auth/reset-password/for-user/%s/token/%s", username, userDoc.getForgetPassword().getUuid());
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
    @Async
    public CompletableFuture<UserDto> addNewUser(UserModel model) {
        return CompletableFuture.supplyAsync(() -> {
            // Check if the user already exists
            Optional<UsersEntity> checkDocument = userRepository.findByUsername(model.getUsername());
            if (checkDocument.isPresent()) {
                throw new SpringVisitorException("Username " + model.getUsername() + " is already present !!",
                        ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
            UsersEntity.Verification verification = new UsersEntity.Verification();
            verification.setGeneratedOn(Instant.now());
            verification.setOtp(generateSixDigitNumber());
            // Create a new user document
            ZonedDateTime nowInIndia = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
            UsersEntity.RefreshToken refreshToken = new UsersEntity.RefreshToken(
                    UUID.randomUUID().toString(),
                    nowInIndia.toInstant(),
                    nowInIndia.plusDays(1).toInstant()
            );
            UsersEntity userEntity = UsersEntity.builder()
                    .contact(model.getContact())
                    .username(model.getUsername())
                    .password(passwordEncoder.encode(model.getPassword()))
                    .role(UsersEntity.ROLE.valueOf(model.getRole().toUpperCase()))
                    .isActive(false)
                    .isVerified(false)
                    .verification(verification)
                    .refreshToken(refreshToken)
                    .build();
            try {
                // Save user to the repository
                UsersEntity user = userRepository.save(userEntity);

                // Prepare the message to be sent to admins
                String message = String.format("%s created a new account! Here is the OTP: %s",
                        model.getUsername(), userEntity.getVerification().getOtp());

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
        UsersEntity checkDocument = userRepository.findByUsername(username)
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
        UsersEntity.RefreshToken refreshToken = new UsersEntity.RefreshToken(
                UUID.randomUUID().toString(),
                nowInIndia.toInstant(),
                nowInIndia.plusDays(30).toInstant()
        );
        checkDocument.setRefreshToken(refreshToken);
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
        UsersEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new SpringVisitorException("Invalid User Id ", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
        if (userEntity.isVerified()) {
            return "User is already verified";
        }
        if (userEntity.getVerification().getOtp() != otp) {
            throw new SpringVisitorException("Invalid OTP ", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }

        if (isOtpExpired(userEntity.getVerification().getGeneratedOn())) {
            throw new SpringVisitorException("Sorry this otp is expired !!", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        userEntity.setVerified(true);
        userEntity.setActive(true);
        userEntity.setVerification(null);
        try {
            userRepository.save(userEntity);
            return "Otp verified successfully !!";
        } catch (Exception e) {
            // Log the error
            logger.error("Unable to verify user: {} - {}", userEntity.getUsername(), e.getMessage());
            // Throw a custom exception for the failure
            throw new SpringVisitorException("Sorry, unable to verify otp for user",
                    ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Async
    public CompletableFuture<String> regeneratedOtpForUser(String userId) {
        return CompletableFuture.supplyAsync(() -> {
            UsersEntity usersEntity = userRepository.findById(userId)
                    .orElseThrow(() -> new SpringVisitorException("Invalid Credentials ", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
            if (usersEntity.isVerified()) {
                throw new SpringVisitorException("User already verified", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
            if (usersEntity.getVerification() != null && !isOtpExpired(usersEntity.getVerification().getGeneratedOn())) {
                throw new SpringVisitorException("Otp is already sent to User", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);

            }
            UsersEntity.Verification verification = new UsersEntity.Verification();
            verification.setGeneratedOn(Instant.now());
            verification.setOtp(generateSixDigitNumber());
            usersEntity.setVerification(verification);
            try {
                userRepository.save(usersEntity);
                // Prepare the message to be sent to admins
                String message = String.format("%s regenerated OTP! Here is the OTP: %s",
                        usersEntity.getUsername(), usersEntity.getVerification().getOtp());
                telegramService.sendMsgToADMIN(message);
                return "Otp resented successfully !!";
            } catch (Exception e) {
                // Log the error
                logger.error("Unable to send otp for user: {} - {}", usersEntity.getUsername(), e.getMessage());
                // Throw a custom exception for the failure
                throw new SpringVisitorException("Sorry, to send otp for user",
                        ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
            }
        });
    }

    @Override
    public CompletableFuture<String> handleForgetPassword(String username) {
        return CompletableFuture.supplyAsync(() -> {
            UsersEntity userDoc = userRepository.findByUsername(username)
                    .orElseThrow(() -> new SpringVisitorException("Username not found", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
            try {

                userDoc.setForgetPassword(new UsersEntity.ForgetPassword(
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

    @Override
    public UserDto.Credentials getJwtFromRefToken(String refreshToken) {
        UsersEntity userDoc = userRepository.findByRefreshTokenToken(refreshToken)
                .orElseThrow(() -> new SpringVisitorException("Refresh token is Invalid !!", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
        UsersEntity.RefreshToken rft = userDoc.getRefreshToken();
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
    public String logoutUser(String userId,
                             String refreshToken,
                             Instant expiration,
                             String jwtToken) {
        UsersEntity user = cacheService.FetchUser(userId);
        UsersEntity.RefreshToken rft = user.getRefreshToken();
        if (rft == null || !rft.getToken().equals(refreshToken)) {
            throw new SpringVisitorException(
                    "Refresh token is invalid.",
                    ErrorType.NOT_FOUND,
                    HttpStatus.BAD_REQUEST
            );
        }
        // Remove refresh token
        user.setRefreshToken(null);
        try {
            // Blacklist JWT
            boolean tokenBlacklisted = cacheService.addInvalidJwt(jwtToken, expiration);
            if (tokenBlacklisted) {
                userRepository.save(user);
            }
            return "Successfully logged out";
        } catch (Exception e) {
            logger.error("Unable to logout user: {} - {}", user.getUsername(), e.getMessage());
            throw new SpringVisitorException(
                    "Unable to logout.",
                    ErrorType.INTERNAL_ERROR,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    @Override
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toSummary).toList();
    }

    @Override
    public UserSummaryDto createUserByAdmin(CreateUserModel model) {
        Optional<UsersEntity> existing = userRepository.findByUsername(model.getUsername());
        if (existing.isPresent()) {
            throw new SpringVisitorException("Username " + model.getUsername() + " is already present !!",
                    ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        UsersEntity user = UsersEntity.builder()
                .username(model.getUsername())
                .password(passwordEncoder.encode(model.getPassword()))
                .contact(model.getContact())
                .role(UsersEntity.ROLE.valueOf(model.getRole().toUpperCase()))
                .isActive(true)
                .isVerified(true)
                .build();
        try {
            return toSummary(userRepository.save(user));
        } catch (Exception e) {
            logger.error("Unable to create user: {} - {}", model.getUsername(), e.getMessage());
            throw new SpringVisitorException("Sorry, unable to create user",
                    ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public UserSummaryDto updateUserRole(String userId, String role) {
        UsersEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new SpringVisitorException("User not found", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
        user.setRole(UsersEntity.ROLE.valueOf(role.toUpperCase()));
        return toSummary(userRepository.save(user));
    }

    @Override
    public UserSummaryDto setUserActive(String userId, boolean isActive) {
        UsersEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new SpringVisitorException("User not found", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
        user.setActive(isActive);
        return toSummary(userRepository.save(user));
    }

    @Override
    public String deleteUser(String userId, String requestingUserId) {
        if (userId.equals(requestingUserId)) {
            throw new SpringVisitorException("You cannot delete your own account", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        UsersEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new SpringVisitorException("User not found", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST));
        if (user.getRole() == UsersEntity.ROLE.ADMIN && userRepository.countByRole(UsersEntity.ROLE.ADMIN) <= 1) {
            throw new SpringVisitorException("Cannot delete the last remaining admin", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        userRepository.delete(user);
        return "User deleted successfully";
    }

    private UserSummaryDto toSummary(UsersEntity user) {
        return new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getContact(),
                user.getRole().name(),
                user.isActive(),
                user.isVerified()
        );
    }

    private boolean isOtpExpired(Instant generatedOn) {
        return Duration.between(generatedOn, Instant.now()).toMinutes() >= OTP_EXPIRATION_MINUTES;
    }

    public int generateSixDigitNumber() {
        Random random = new Random();
        return 100000 + random.nextInt(900000);
    }
}
