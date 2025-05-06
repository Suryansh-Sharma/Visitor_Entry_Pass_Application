package com.suryansh.visitorentry.service.interfaces;

import com.suryansh.visitorentry.dto.TelegramIdDto;
import com.suryansh.visitorentry.model.TelegramIdModel;
import com.suryansh.visitorentry.dto.TelegramMessageDto;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface TelegramService {
    void sendVisitMessageToHost(TelegramMessageDto telegramMessageDto) throws TelegramApiException;

    CompletableFuture<String> addNewTelegramId(TelegramIdModel dto);

    void sendMsgToADMIN(String message);

    List<TelegramIdDto> getAllTelegramIdsDto();

    CompletableFuture<String> updateTelegramId(TelegramIdModel dto, String id);

    CompletableFuture<String> deleteTelegramId(String id);

}
