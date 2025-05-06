package com.suryansh.visitorentry.controller;

import com.suryansh.visitorentry.dto.UserDto;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.model.UserModel;
import com.suryansh.visitorentry.security.JwtService;
import com.suryansh.visitorentry.security.UserPrincipal;
import com.suryansh.visitorentry.service.interfaces.UserService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.Instant;
import java.util.concurrent.CompletableFuture;

/**
 * This Controller class is used for register new user, login user.
 * This class in under development, so new features like JWT, Spring-Security etc. will be added soon.
 */
@Controller
@CrossOrigin("*")
public class UserController {
    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @MutationMapping
    @Async
    public CompletableFuture<UserDto> registerNewUser(@Argument("input") @Valid UserModel model){
        return userService.addNewUser(model);
    }
    @MutationMapping
    public UserDto loginUser(@Argument("username")String username, @Argument("password")String password ){
        return userService.loginUser(username,password);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public String verifyOtpForUser(@Argument("Otp") int Otp){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userService.verifyUserAccount(Otp,userPrincipal.getUsername());
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    @Async
    public CompletableFuture<String> regenerateOtpForUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userService.regeneratedOtpForUser(userPrincipal.getUsername());
    }

    @Async
    @MutationMapping
    public CompletableFuture<String> forgetPassword(@Argument("username") String username){
        return userService.handleForgetPassword(username);
    }

    @MutationMapping
    public UserDto.Credentials regenJwtFromRefreshToken(@Argument("refreshToken") String token){
        return userService.getJwtFromRefToken(token);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public String handleLogout(@Argument("authorization") String authHeader, @Argument String refreshToken) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }
        if (jwtToken == null) {
            throw new SpringVisitorException("Missing or Improper token pass :- Bearer <Token> ", ErrorType.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST);
        }

        Claims claims = jwtService.extractAllClaims(jwtToken);
        Instant expiration = claims.getExpiration().toInstant();
        System.out.println("expiration: " + expiration);
        return userService.logoutUser(userPrincipal.getUsername(),refreshToken,expiration,jwtToken);
    }

}
