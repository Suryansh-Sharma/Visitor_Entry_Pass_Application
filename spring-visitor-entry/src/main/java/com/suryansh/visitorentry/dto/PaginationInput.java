package com.suryansh.visitorentry.dto;

import org.springframework.data.domain.Sort;

public record PaginationInput(int pageNo, int pageSize, String sortBy, Sort.Direction sortOrder) {
}
