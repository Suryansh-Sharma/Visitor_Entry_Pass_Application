package com.suryansh.visitorentry.dto;

import java.util.List;

public record PageResponse<T>(
        int pageNo,
        int pageSize,
        long totalData,
        int totalPages,
        List<T> data
) {

    public static <T> PageResponse<T> empty(
            int pageNo,
            int pageSize
    ) {
        return new PageResponse<>(
                pageNo,
                pageSize,
                0,
                0,
                List.of()
        );
    }
}
