package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.bot.MyTelegramBot;
import com.suryansh.visitorentry.dto.TelegramIdDto;
import com.suryansh.visitorentry.dto.TelegramMessageDto;
import com.suryansh.visitorentry.entity.TelegramIdDocument;
import com.suryansh.visitorentry.entity.UserDocument;
import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.model.TelegramIdModel;
import com.suryansh.visitorentry.repository.TelegramIdRepository;
import com.suryansh.visitorentry.service.interfaces.CacheService;
import com.suryansh.visitorentry.service.interfaces.TelegramService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;
import org.telegram.telegrambots.meta.api.objects.InputFile;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

/**
 * This class is used to perform a telegram operation like send a message.
 *
 * @author suryansh
 */
@Service
@EnableCaching
public class TelegramServiceImpl implements TelegramService {
    private final TelegramIdRepository telegramIdRepository;
    private final MapperService mapperService;
    private final CacheService cacheService;
    @Value("${folder.images}")
    private String FOLDER_PATH;
    @Value("${telegram.chatIdSuryansh}")
    private String DEFAULT_CHAT_ID;

    private final MyTelegramBot telegramBot;
    private static final Logger logger = LoggerFactory.getLogger(TelegramServiceImpl.class);

    public TelegramServiceImpl(TelegramIdRepository telegramIdRepository, MyTelegramBot telegramBot, MapperService mapperService, CacheService cacheService) {
        this.telegramIdRepository = telegramIdRepository;
        this.telegramBot = telegramBot;
        this.mapperService = mapperService;
        this.cacheService = cacheService;
    }

    @Override
    @Async
    public void sendVisitMessageToHost(TelegramMessageDto dto) {
        try {
            if(dto.hostName().equals("OTHER")){
                return;
            }
            // Retrieve chat ID
            TelegramIdDocument telegramIdByName = getTelegramIdByName(dto.hostName());
            if (telegramIdByName == null || telegramIdByName.getChatId().isEmpty()) {
                logger.error("Chat ID not found for user: {}. Unable to send message.", dto.hostName());
                return;
            }

            String chatId = telegramIdByName.getChatId();
            SendPhoto sendPhoto = new SendPhoto();
            sendPhoto.setChatId(chatId);

            // Prepare and validate image file
            String imagePath = FOLDER_PATH + "/" + dto.visitorImage();
            File imageFile = new File(imagePath);
            if (!imageFile.exists()) {
                logger.error("Image file not found at {}. Unable to send photo for visitor: {}", imagePath, dto.visitorName());
                return;
            }

            // Set photo and caption
            sendPhoto.setPhoto(new InputFile(imageFile));
            sendPhoto.setCaption(buildMessage(dto));

            // Execute Telegram message
            telegramBot.execute(sendPhoto);
            logger.info("Telegram message sent successfully for visitor {} to host {}.", dto.visitorName(), dto.hostName());

        } catch (TelegramApiException e) {
            logger.error("Failed to send message via Telegram for visitor {}: {}", dto.visitorName(), e.getMessage(), e);
        } catch (Exception e) {
            logger.error("An unexpected error occurred in sendNewVisitMessage for visitor {}: {}", dto.visitorName(), e.getMessage(), e);
        }
    }

    public TelegramIdDocument getTelegramIdByName(String name) {
        return cacheService.getAllTelegramIdFromCache().stream()
                .filter(doc -> doc.getHostName().equals(name))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<TelegramIdDto> getAllTelegramIdsDto() {
        return cacheService.getAllTelegramIdFromCache().stream()
                .map(mapperService::MapTelegramDocToDto)
                .toList();
    }

    @Override
    public CompletableFuture<String> updateTelegramId(TelegramIdModel dto, String id) {
        return CompletableFuture.supplyAsync(()->{
            Optional<TelegramIdDocument> optional = getTelegramIdByIdAndCheckDuplicate(id,dto);
            if (optional.isEmpty()){
                throw new SpringVisitorException("Unable to find record !!", ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND);
            }

            TelegramIdDocument oldDocument = optional.get();
            oldDocument.setRole(dto.getRole());
            oldDocument.setChatId(dto.getChatId());
            oldDocument.setHostName(dto.getHostName());
            try {
                telegramIdRepository.save(oldDocument);
                String msg = String.format("Telegram Chat_Id:- %s info of :- %s is updated successfully.", oldDocument.getChatId(), oldDocument.getHostName());
                sendMsgToADMIN(msg);
                return "Telegram Id is updated successfully.";
            } catch (Exception e) {
                logger.error("Unable to update telegram chat id {}", e.toString());
                throw new SpringVisitorException("Unable to update chat id in software", ErrorType.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });

    }

    @Override
    @CacheEvict(value = "telegramIdDocument", allEntries = true)
    public CompletableFuture<String> deleteTelegramId(String id) {
        return CompletableFuture.supplyAsync(()->{
            TelegramIdDocument document = cacheService.getAllTelegramIdFromCache().stream()
                    .filter(record -> record.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new SpringVisitorException("Unable to find record !!", ErrorType.NOT_FOUND, HttpStatus.NOT_FOUND));

            try{
                telegramIdRepository.delete(document);
                String msg = String.format("Telegram Chat_Id:- %s is deleted successfully of Host:- %s of Role:- %s", document.getChatId(),
                        document.getHostName(), document.getRole());
                sendMsgToADMIN(msg);
                logger.info("Telegram Id {} is deleted successfully.", id);
                return "Successfully deleted telegram id. "+id;
            }catch (Exception e) {
                logger.error("Unable to delete telegram chat id {}", e.toString());
                throw new SpringVisitorException("Unable to delete in software", ErrorType.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }


    @Override
    @CacheEvict(value = "telegramIdDocument", allEntries = true)
    public CompletableFuture<String> addNewTelegramId(TelegramIdModel model) {
        return CompletableFuture.supplyAsync(()->{
            checkTelegramIdExist(model);
            TelegramIdDocument newRecord = TelegramIdDocument.builder()
                    .hostName(model.getHostName())
                    .role(model.getRole())
                    .chatId(model.getChatId())
                    .dateOfJoin(LocalDateTime.now())
                    .build();
            try {
                telegramIdRepository.save(newRecord);
                String msg = String.format("Telegram Id:- %s is added successfully for host:- %s", newRecord.getId(),newRecord.getHostName());
                logger.info("New {} record is added successfully for telegram messaging ", model);
                sendMsgToADMIN(msg);
                return "New Id is added successfully for telegram messaging";
            } catch (Exception e) {
                logger.error("Unable to save telegram chat id {} ", e.toString());
                throw new SpringVisitorException("Unable to save chat id in software", ErrorType.INTERNAL_ERROR, HttpStatus.BAD_REQUEST);
            }
        });

    }

    @Override
    public void sendMsgToADMIN(String subMessage) {
        List<TelegramIdDocument> adminsList = telegramIdRepository.findAllByRole(UserDocument.ROLE.ADMIN);
        // If list is empty then send QR Code to main dev.
        if (adminsList.isEmpty()) {
            try {
                SendMessage sendMessage = new SendMessage();
                sendMessage.setChatId(DEFAULT_CHAT_ID); // Set the chat ID from the document
                sendMessage.setText(String.format("Hey %s, %s", "Suryansh Sharma", subMessage)); // Format the message
                // Sending the message using telegramBot (ensure this is properly instantiated/injected)
                sendMessage.setParseMode("HTML");
                telegramBot.execute(sendMessage);
            } catch (TelegramApiException e) {
                // Log the error and continue sending to the other admins
                logger.error("Failed to send message to DEFAULT admin with chatId: {} ", DEFAULT_CHAT_ID);
            }
        }
        for (TelegramIdDocument telegramIdDoc : adminsList) {
            try {
                SendMessage sendMessage = new SendMessage();
                sendMessage.setChatId(telegramIdDoc.getChatId()); // Set the chat ID from the document
                sendMessage.setText(String.format("Hey %s, %s", telegramIdDoc.getHostName(), subMessage)); // Format the message
                sendMessage.setParseMode("HTML");

                // Sending the message using telegramBot (ensure this is properly instantiated/injected)
                telegramBot.execute(sendMessage);
            } catch (TelegramApiException e) {
                // Log the error and continue sending to the other admins
                logger.error("Failed to send message to admin with chatId: {} ", telegramIdDoc.getChatId());
            }
        }
    }



    private void checkTelegramIdExist(TelegramIdModel dto) {
        cacheService.getAllTelegramIdFromCache()
                .forEach(document -> {
                    if (document.getHostName().equals(dto.getHostName())) {
                        throw new SpringVisitorException("User name is already present", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
                    }else if (document.getChatId().equals(dto.getChatId())) {
                        throw new SpringVisitorException("ChatId is already present", ErrorType.BAD_REQUEST, HttpStatus.BAD_REQUEST);
                    }
                });
    }
    // Helper method to build message
    private String buildMessage(TelegramMessageDto dto) {
        return String.format("New visit added:\nVisitor Name: %s\nContact Number: %s\nReason: %s\nAddress: %s, %s, %s",
                dto.visitorName(), dto.visitorContact(), dto.reason(), dto.line1(), dto.city(), dto.pinCode());
    }

    private Optional<TelegramIdDocument> getTelegramIdByIdAndCheckDuplicate(String id,TelegramIdModel model) {
        Optional<TelegramIdDocument> res = Optional.empty();
        for (TelegramIdDocument document:cacheService.getAllTelegramIdFromCache()) {
            if (document.getId().equals(id)) {
                res = Optional.of(document);
            }else if (document.getHostName().equals(model.getHostName()) || document.getChatId().equals(model.getChatId())) {
                throw new SpringVisitorException("Chat Id and Hostname must be unique !! ",
                        ErrorType.BAD_REQUEST,HttpStatus.BAD_REQUEST);
            }
        }
        return res;
    }

}