package com.suryansh.visitorentry.controller;

import com.suryansh.visitorentry.entity.UserDocument;
import com.suryansh.visitorentry.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;

@Controller
@RequestMapping("/api/auth/")
public class MvcController {
    @Value("${expiration_time}")
    private long EXPIRATION_MIN ;
    private static final Logger logger = LoggerFactory.getLogger(MvcController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public MvcController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("reset-password/for-user/{username}/token/{token}")
    public String showPasswordResetForm(@PathVariable String username,@PathVariable String token, Model model) {
        model.addAttribute("token", token);
        model.addAttribute("title", "Reset Password For "+username.toUpperCase());
        return "forget-pass-form";
    }

    @PostMapping("submit-reset-password")
    public String submitResetPassword(@RequestParam("token") String token,
                                      @RequestParam("password") String password,
                                      Model model) {
        Optional<UserDocument> optional = userRepository.findByForgetPassword_UUID(token);
        if (optional.isEmpty()) {
            model.addAttribute("error","No request token found for password reset");
            return "error-page";
        }
        UserDocument userDocument = optional.get();
        long LINK_EXPIRE = EXPIRATION_MIN * 60 * 1000;
        Instant generatedOn = userDocument.getForgetPassword().getGeneratedOn();
        if (generatedOn.plusMillis(LINK_EXPIRE).isBefore(Instant.now())) {
            logger.error("Reset Password Link expired for : user {} ", userDocument.getId());
            model.addAttribute("error", "Sorry this link is only valid for 30 minutes. Please re-generate.");
            return "error-page";
        }
        try{
            userDocument.setRefreshTokens(new ArrayList<>());
            userDocument.setPassword(passwordEncoder.encode(password));
            userDocument.setForgetPassword(null);
            userRepository.save(userDocument);
            model.addAttribute("message", "Close the Tab and re-login to application !!");
            return "success-page";
        }
        catch (Exception e){
            logger.error("Error while submitting reset password", e);
            model.addAttribute("error", "An unexpected error occurred. Please try again later.");
            return "error-page";
        }
    }
}
