package com.suryansh.visitorentry.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.suryansh.visitorentry.entity.UserDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TelegramIdDto {
    private String id;
    private String hostName;
    private String chatId;
    private UserDocument.ROLE role;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateOfJoin;
}
