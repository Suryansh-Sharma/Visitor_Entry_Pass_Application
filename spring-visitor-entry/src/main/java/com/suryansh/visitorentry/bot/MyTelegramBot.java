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
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageReplyMarkup;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.List;

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
        String[] parts = data.split("\\|");
        if (parts.length != 3) {
            logger.warn("Invalid callback data: {}", data);
            return;
        }
        String action = parts[1];
        String visitId = parts[2];
        if (!"ACCEPT".equals(action) && !"REJECT".equals(action)) {
            logger.warn("Unknown action: {}", action);
            return;
        }
        logger.info("Telegram callback: action={}, visitId={}", action, visitId);
        String message;
        try {
            message = listenTelegramEvent.manageVisitorReq(visitId, action);
        } catch (Exception e) {
            logger.error("Error processing visit request for visitId={}", visitId, e);
            message = "❌ Error processing visitor request";
        }
        try {
            webSocketService.sendVisitUpdate(visitId, action, message);
            logger.info("WebSocket notification sent for visitId={} action={}", visitId, action);
        } catch (Exception e) {
            logger.error("Failed to send WebSocket update for visitId={}", visitId, e);
        }
        acknowledgeCallback(callbackQuery, action, message);
    }

    public void acknowledgeCallback(CallbackQuery callbackQuery,
                                    String action,
                                    String responseMessage) {

        try {
            AnswerCallbackQuery answer = new AnswerCallbackQuery();
            answer.setCallbackQueryId(callbackQuery.getId());
            answer.setText(getPopupText(action));

            execute(answer);
            if (callbackQuery.getMessage() instanceof Message message) {
                EditMessageReplyMarkup removeButtons =
                        new EditMessageReplyMarkup();
                removeButtons.setChatId(message.getChatId().toString());
                removeButtons.setMessageId(message.getMessageId());
                InlineKeyboardMarkup emptyMarkup =
                        new InlineKeyboardMarkup();
                emptyMarkup.setKeyboard(List.of());

                removeButtons.setReplyMarkup(emptyMarkup);

                execute(removeButtons);
            }
            SendMessage confirmation = new SendMessage();
            confirmation.setChatId(
                    callbackQuery.getFrom().getId().toString()
            );
            confirmation.setText(responseMessage);
            confirmation.setParseMode("HTML");
            execute(confirmation);
        } catch (TelegramApiException e) {
            logger.error(
                    "Failed to process callback for action {} and query {}",
                    action,
                    callbackQuery.getId(),
                    e
            );
        }
    }

    private String getPopupText(String action) {
        return switch (action) {
            case "ACCEPT" -> "✅ VisitorsEntity accepted";
            case "REJECT" -> "❌ VisitorsEntity rejected";
            default -> "⚠️ Action processed";
        };
    }

}
