package com.suryansh.visitorentry.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.Statement;

@Configuration
public class SQLiteStartupConfig {

    @Bean
    ApplicationRunner sqliteStartupInitializer(
            DataSource dataSource,
            @Value("${folder.images}") String imageFolder) {
        return args -> {
            Files.createDirectories(Path.of(imageFolder));
            try (Connection connection = dataSource.getConnection();
                 Statement statement = connection.createStatement()) {
                statement.execute("PRAGMA journal_mode=WAL");
                statement.execute("PRAGMA busy_timeout=5000");
            }
        };
    }
}
