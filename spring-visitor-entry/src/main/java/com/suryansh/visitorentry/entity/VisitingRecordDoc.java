package com.suryansh.visitorentry.entity;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("Visiting_Record")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class VisitingRecordDoc {
    private String id;
    private String visitorId;
    private Instant visitedOn;
    private String reason;
    private String visitorHost;
    private Status status;
    private String note;
    public enum Status {
        COMPLETED,
        CANCELLED,
        NOT_AVAILABLE,
        PENDING,
        HOST_NOT_AVAILABLE,
    }
}
