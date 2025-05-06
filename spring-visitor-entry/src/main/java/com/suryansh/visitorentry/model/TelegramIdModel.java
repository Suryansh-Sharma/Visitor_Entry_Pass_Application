package com.suryansh.visitorentry.model;

import com.suryansh.visitorentry.entity.UserDocument;
import lombok.Data;

import java.time.Instant;

@Data
public class TelegramIdModel{
    private String hostName;
    private String chatId;
    private UserDocument.ROLE role;
    private Instant dateOfJoin;

}