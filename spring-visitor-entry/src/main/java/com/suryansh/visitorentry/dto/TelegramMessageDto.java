package com.suryansh.visitorentry.dto;

/**
 * This java record class is used to internal communication.
 * It carries a telegram message for sending operation to a user.
 *
 * @param visitorContact It contains a visitor contact number.
 * @param visitorName    It contains a visitor name.
 * @param reason         It contains a reason for a visit
 * @param visitorImage   It contains an image link of a visitor.
 * @param hostName       It includes a location of visit e.g.: Reception,Office etc.
 * @param city           It includes the resident city of a visitor.
 * @param line1          It includes area, colony etc. info of user address.
 * @author suryansh
 */
public record TelegramMessageDto(String visitorContact,
                                 String visitorName,
                                 String reason,
                                 String visitorImage,
                                 String hostName,
                                 String city,
                                 String line1,
                                 String pinCode) {
}
