package com.suryansh.visitorentry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * TechStack:- MongoDB,GraphQl,
 * <p>
 * The application provides backend functionality for Visitor-Entry-Management, including
 * adding new visit, get today all visit, searching for a visitor, capturing visitor image and info, etc.
 * <p>
 *
 * Application Configuration in {@link "classpath:/resources/application.yaml" }:
 * MongoDb Configuration.
 * Image folder location config to store visitor images.
 * Telegram bot config : - username , token , chatId.
 *
 * @author Suryansh Sharma
 * @version SpringBoot-3 , Java 19
 * @since 2023-06-17
 *
 */
@SpringBootApplication
@EnableAsync
@EnableCaching
@EnableScheduling
public class SpringVisitorEntryApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringVisitorEntryApplication.class, args);
    }


}


