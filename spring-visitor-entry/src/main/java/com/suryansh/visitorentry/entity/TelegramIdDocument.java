package com.suryansh.visitorentry.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@Document("Telegram_Id")
public class TelegramIdDocument {
    @Id
    private String id;
    private String hostName;
    private String chatId;
    private UserDocument.ROLE role;
    private LocalDateTime dateOfJoin;

}
