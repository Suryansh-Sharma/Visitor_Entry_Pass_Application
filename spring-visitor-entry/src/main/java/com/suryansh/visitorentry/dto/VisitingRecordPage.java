package com.suryansh.visitorentry.dto;

import java.util.List;

public record VisitingRecordPage(
        int pageNo,
        int totalPages,
        List<?> data,
        int pageSize,
        long totalData
) {
}