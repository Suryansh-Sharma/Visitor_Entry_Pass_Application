package com.suryansh.visitorentry.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.Instant;
import java.time.format.DateTimeParseException;

@Converter(autoApply = true)
public class InstantAttributeConverter implements AttributeConverter<Instant, String> {

    @Override
    public String convertToDatabaseColumn(Instant attribute) {
        return attribute == null ? null : attribute.toString();
    }

    @Override
    public Instant convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        String value = dbData.trim();
        if (SqliteDateTimeParsing.isEpochMillis(value)) {
            return Instant.ofEpochMilli(Long.parseLong(value));
        }
        try {
            return Instant.parse(value);
        } catch (DateTimeParseException ignored) {
            return SqliteDateTimeParsing.parseLegacySqliteTimestamp(value).atZone(SqliteDateTimeParsing.APP_ZONE).toInstant();
        }
    }
}
