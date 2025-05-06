package com.suryansh.visitorentry.controller;

import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GeneralController {
    private final ApplicationContext applicationContext;

    public GeneralController(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @GetMapping("shutdown-spring-backend-visitor-entry-pass")
    private void shutdownSpringBackendVisitorEntryPass() {
        SpringApplication.exit(applicationContext, () -> 0);
    }
}
