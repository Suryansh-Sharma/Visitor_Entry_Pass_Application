package com.suryansh.visitorentry.dto;

import com.suryansh.visitorentry.entity.VisitingRecordDoc;

import java.time.LocalDate;

public record VisitFilterInput(
        String id,
        String visitorContact,
        String visitorName,
        String visitorHost,
        VisitingRecordDoc.Status status,
        LocalDate fromDate,
        LocalDate toDate,
        String reason
) {
}