package com.suryansh.visitorentry.service.interfaces;

import com.suryansh.visitorentry.dto.PaginationDto;
import com.suryansh.visitorentry.dto.VisitingRecordPage;
import com.suryansh.visitorentry.dto.VisitorDto;
import com.suryansh.visitorentry.entity.VisitorDoc;
import com.suryansh.visitorentry.model.SearchFilter;
import com.suryansh.visitorentry.model.VisitModel;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface VisitorService {
    CompletableFuture<String> addNewVisitInDb(VisitModel visitModel);

    String handleBanVisitor(String visitorId, String reason);

    String handleBanUnVisitor(String visitorId);

    VisitorDto getVisitorDetailByContact(String visitorContact);

    VisitorDto getVisitorById(String visitorId);

    VisitorDto handleUpdateVisitorProfile(VisitorDoc visitorDoc);

    PaginationDto getVisitorOnSpecificDate(LocalDate date, int pageSize, int pageNumber, String sortBy, String sortOrder);

    VisitingRecordPage searchVisitor(List<SearchFilter> filters, int pageSize, int pageNumber, String sortBy, String sortOrder);

    PaginationDto handleGetVisitorsInPeriod(String fromDate, String toDate, int pageSize, int pageNumber, String sortBy, String sortOrder);

    VisitingRecordPage visitsOfVisitor(String id, int pageNumber, int pageSize, String sortBy, String sortOrder);

}
