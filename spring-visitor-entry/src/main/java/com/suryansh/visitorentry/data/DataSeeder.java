package com.suryansh.visitorentry.data;

import com.suryansh.visitorentry.entity.TelegramIdEntity;
import com.suryansh.visitorentry.entity.UsersEntity;
import com.suryansh.visitorentry.repository.TelegramIdRepository;
import com.suryansh.visitorentry.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataSeeder {
    @Value("${telegram.chatIdSuryansh}")
    private String adminTelegramId;

    @Bean
    CommandLineRunner seed(
            UserRepository usersRepository,
            TelegramIdRepository telegramIdRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            if (usersRepository.count() == 0) {
                UsersEntity admin = new UsersEntity();
                admin.setUsername("Suryansh@dev.com");
                admin.setPassword(passwordEncoder.encode("Suryansh@1234"));
                admin.setContact("6399028046");
                admin.setActive(true);
                admin.setVerified(true);
                admin.setRole(UsersEntity.ROLE.ADMIN);

                usersRepository.save(admin);
            }
            if (telegramIdRepository.findAll().isEmpty()) {
                TelegramIdEntity telegram = new TelegramIdEntity();
                telegram.setChatId(adminTelegramId);
                telegram.setHostName("Suryansh");
                telegram.setRole(UsersEntity.ROLE.ADMIN);
                telegram.setDateOfJoin(LocalDateTime.now());

                telegramIdRepository.save(telegram);
            }
        };
    }
}