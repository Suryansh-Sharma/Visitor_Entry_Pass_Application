package com.suryansh.visitorentry.model;

import com.suryansh.visitorentry.entity.UsersEntity;
import lombok.Data;

import java.time.Instant;

@Data
public class TelegramIdModel {
    private String hostName;
    private String chatId;
    private UsersEntity.ROLE role;
    private Instant dateOfJoin;
}