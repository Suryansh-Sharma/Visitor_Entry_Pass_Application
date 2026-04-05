package com.suryansh.visitorentry.bot;

import com.suryansh.visitorentry.service.ListenTelegramEvent;
import com.suryansh.visitorentry.service.WebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.AnswerCallbackQuery;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

@Component
public class MyTelegramBot extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(MyTelegramBot.class);
    private final ListenTelegramEvent listenTelegramEvent;
    private final WebSocketService webSocketService;
    @Value("${telegram.bot.username}")
    private String botUsername;

    @Value("${telegram.bot.token}")
    private String botToken;

    public MyTelegramBot(ListenTelegramEvent listenTelegramEvent, WebSocketService webSocketService) {
        this.listenTelegramEvent = listenTelegramEvent;
        this.webSocketService = webSocketService;
    }


    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update == null || !update.hasCallbackQuery()) {
            return;
        }
        CallbackQuery callbackQuery = update.getCallbackQuery();
        String data = callbackQuery.getData();
        if (data == null || !data.startsWith("VISIT|")) {
            return;
        }
        try {
            String[] parts = data.split("\\|");
            if (parts.length != 3) {
                logger.warn("Invalid callback data: {}", data);
                return;
            }
            String action = parts[1];
            String visitId = parts[2];
            // Process the visitor request
            if ("ACCEPT".equals(action) || "REJECT".equals(action)) {
                String message = listenTelegramEvent.manageVisitorReq(visitId, action);
                webSocketService.sendVisitUpdate(visitId, action, message);
                acknowledgeCallback(callbackQuery, action, message);
            } else {
                logger.warn("Unknown action: {}", action);
            }
            // Acknowledge callback to show popup
        } catch (Exception e) {
            logger.error("Error processing callbackQuery", e);
        }
    }

    public void acknowledgeCallback(CallbackQuery callbackQuery, String action, String responseMessage) {
        try {
            // ✅ 1. Acknowledge callback (popup)
            AnswerCallbackQuery answer = new AnswerCallbackQuery();
            answer.setCallbackQueryId(callbackQuery.getId());
            answer.setText(getPopupText(action));
            execute(answer);

            // ✅ 2. Edit an original message (better UX than sending new one)
            EditMessageText editMessage = new EditMessageText();
            editMessage.setChatId(callbackQuery.getMessage().getChatId().toString());
            editMessage.setMessageId(callbackQuery.getMessage().getMessageId());
            editMessage.setText(responseMessage);
            editMessage.setParseMode("HTML");
            execute(editMessage);

        } catch (TelegramApiException e) {
            logger.error("Failed to process callback for action {} and query {}", action, callbackQuery.getId(), e);
        }
    }

    private String getPopupText(String action) {
        switch (action) {
            case "ACCEPT":
                return "✅ Visitor accepted";
            case "REJECT":
                return "❌ Visitor rejected";
            default:
                return "⚠️ Action processed";
        }
    }

}
