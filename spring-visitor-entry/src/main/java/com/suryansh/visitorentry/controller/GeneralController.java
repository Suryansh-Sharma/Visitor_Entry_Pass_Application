package com.suryansh.visitorentry.controller;

import com.suryansh.visitorentry.service.WebSocketService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/application")
public class GeneralController {
    private final ApplicationContext applicationContext;
    private final WebSocketService webSocketService;

    public GeneralController(ApplicationContext applicationContext, WebSocketService webSocketService) {
        this.applicationContext = applicationContext;
        this.webSocketService = webSocketService;
    }

    @GetMapping("shutdown-spring-backend-visitor-entry-pass")
    private void shutdownSpringBackendVisitorEntryPass() {
        SpringApplication.exit(applicationContext, () -> 0);
    }

    @GetMapping("/health")
    private String getApplicationHealth(){
        return "Application is up and running";
    }

    @GetMapping("/test-ws")
    private String testWebSocket() {
        webSocketService.sendVisitUpdate("test-id", "ACCEPT", "Test: WebSocket is working ✅");
        return "WebSocket message sent";
    }
}
