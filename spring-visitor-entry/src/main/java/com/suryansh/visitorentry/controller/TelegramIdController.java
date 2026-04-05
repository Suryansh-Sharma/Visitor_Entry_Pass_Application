package com.suryansh.visitorentry.controller;

import com.suryansh.visitorentry.dto.TelegramIdDto;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.model.TelegramIdModel;
import com.suryansh.visitorentry.service.WebSocketService;
import com.suryansh.visitorentry.service.interfaces.TelegramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Controller
@CrossOrigin("*")
public class TelegramIdController {
    private final TelegramService telegramService;
    @Autowired
    private  WebSocketService webSocketService;

    public TelegramIdController(TelegramService telegramService) {
        this.telegramService = telegramService;
    }

    @MutationMapping
    @Async
    @PreAuthorize("isAuthenticated()")
    public CompletableFuture<String> addNewTelegramId(@Argument("input") TelegramIdModel dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasAdminRole = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!hasAdminRole) {
            throw new SpringVisitorException("Sorry you have not the ADMIN role to access this resource",
                    ErrorType.FORBIDDEN, HttpStatus.FORBIDDEN);
        }else{
            return telegramService.addNewTelegramId(dto);
        }
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<TelegramIdDto> getAllTelegramIds() {
        return telegramService.getAllTelegramIdsDto();
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public CompletableFuture<String> updateTelegramId(@Argument("input") TelegramIdModel dto, @Argument("id") String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasAdminRole = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!hasAdminRole) {
            throw new SpringVisitorException("Sorry you have not the ADMIN role to access this resource",
                    ErrorType.FORBIDDEN, HttpStatus.FORBIDDEN);
        }else{
            return telegramService.updateTelegramId(dto, id);
        }
    }

    @MutationMapping
    @Async
    @PreAuthorize("isAuthenticated()")
    public CompletableFuture<String> deleteTelegramId(@Argument("id") String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasAdminRole = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!hasAdminRole) {
            throw new SpringVisitorException("Sorry you do not have the ADMIN role to access this resource",
                    ErrorType.FORBIDDEN, HttpStatus.FORBIDDEN);
        }else{
            return telegramService.deleteTelegramId(id);
        }
    }
    @MutationMapping
    public String testTelegram(@Argument("id") String id) throws TelegramApiException {

//        this.telegramService.sendVisitMessageToHost(dto);
        webSocketService.sendVisitUpdate("6399028046","Accepted","msg");
        return"hello";

    }

}
