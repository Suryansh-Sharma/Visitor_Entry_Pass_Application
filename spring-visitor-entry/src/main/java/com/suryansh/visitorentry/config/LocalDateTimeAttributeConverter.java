package com.suryansh.visitorentry.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@Converter(autoApply = true)
public class LocalDateTimeAttributeConverter implements AttributeConverter<LocalDateTime, String> {

    @Override
    public String convertToDatabaseColumn(LocalDateTime attribute) {
        return attribute == null ? null : attribute.toString();
    }

    @Override
    public LocalDateTime convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        String value = dbData.trim();
        if (SqliteDateTimeParsing.isEpochMillis(value)) {
            return LocalDateTime.ofInstant(Instant.ofEpochMilli(Long.parseLong(value)), SqliteDateTimeParsing.APP_ZONE);
        }
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
            return SqliteDateTimeParsing.parseLegacySqliteTimestamp(value);
        }
    }
}
