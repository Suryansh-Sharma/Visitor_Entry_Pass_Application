package com.suryansh.visitorentry;

import com.suryansh.visitorentry.bot.MyTelegramBot;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

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

    @Bean
    public TelegramBotsApi telegramBotsApi(MyTelegramBot bot) throws Exception {
        TelegramBotsApi api = new TelegramBotsApi(DefaultBotSession.class);
        api.registerBot(bot);
        return api;
    }
}


