package com.suryansh.visitorentry.service.interfaces;

import com.suryansh.visitorentry.dto.UserDto;
import com.suryansh.visitorentry.dto.UserSummaryDto;
import com.suryansh.visitorentry.model.CreateUserModel;
import com.suryansh.visitorentry.model.UserModel;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface UserService {
    CompletableFuture<UserDto> addNewUser(UserModel model);

    UserDto loginUser(String username, String password);

    String verifyUserAccount(int otp, String userId);

    CompletableFuture<String> regeneratedOtpForUser(String userId);

    CompletableFuture<String> handleForgetPassword(String username);

    UserDto.Credentials getJwtFromRefToken(String token);

    String logoutUser(String userId, String refreshToken, Instant expiration, String jwtToken);

    List<UserSummaryDto> getAllUsers();

    UserSummaryDto createUserByAdmin(CreateUserModel model);

    UserSummaryDto updateUserRole(String userId, String role);

    UserSummaryDto setUserActive(String userId, boolean isActive);

    String deleteUser(String userId, String requestingUserId);
}
