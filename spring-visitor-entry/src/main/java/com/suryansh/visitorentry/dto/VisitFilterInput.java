package com.suryansh.visitorentry.dto;

import com.suryansh.visitorentry.entity.VisitingRecordEntity;

import java.time.LocalDate;

public record VisitFilterInput(
        String visitorId,
        String visitorContact,
        String visitorName,
        String visitorHost,
        VisitingRecordEntity.Status status,
        LocalDate fromDate,
        LocalDate toDate,
        String reason
) {
}
