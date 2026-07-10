package com.suryansh.visitorentry.config;

import java.time.ZoneId;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

final class SqliteDateTimeParsing {
    static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter SQLITE_TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private static final DateTimeFormatter SQLITE_TIMESTAMP_WITHOUT_MILLIS_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private SqliteDateTimeParsing() {
    }

    static boolean isEpochMillis(String value) {
        return value.matches("\\d+");
    }

    /**
     * Fallback for the legacy "yyyy-MM-dd HH:mm:ss[.SSS]" formats SQLite/Hibernate may have
     * written before the ISO-8601 string format was adopted.
     */
    static LocalDateTime parseLegacySqliteTimestamp(String value) {
        try {
            return LocalDateTime.parse(value, SQLITE_TIMESTAMP_FORMAT);
        } catch (DateTimeParseException ignored) {
            return LocalDateTime.parse(value, SQLITE_TIMESTAMP_WITHOUT_MILLIS_FORMAT);
        }
    }
}
