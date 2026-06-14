package com.suryansh.visitorentry.controller;

import com.suryansh.visitorentry.dto.SetupInfoDto;
import com.suryansh.visitorentry.service.interfaces.TelegramService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/setup")
public class SetupController {

    private final TelegramService telegramService;
    public SetupController(TelegramService telegramService) {

        this.telegramService = telegramService;
    }

//    @GetMapping("/info")
//    public SetupInfoDto getSetupInfo(){
//
//    }
}
