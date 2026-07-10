package com.suryansh.visitorentry.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "visiting_records")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitingRecordEntity {

    @Id
    @UuidGenerator
    private String id;
    private String visitorId;
    private Instant visitedOn;
    private String reason;
    private String visitorHost;
    @Enumerated(EnumType.STRING)
    private Status status;
    private String note;

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED,
        COMPLETED,
        CANCELLED,
        HOST_NOT_AVAILABLE,
        NOT_AVAILABLE
    }
}