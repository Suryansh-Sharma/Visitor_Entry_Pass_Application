package com.suryansh.visitorentry.service.interfaces;

import com.suryansh.visitorentry.dto.*;
import com.suryansh.visitorentry.entity.VisitorDoc;
import com.suryansh.visitorentry.model.AddNewVisitModel;

import java.util.concurrent.CompletableFuture;

public interface VisitorService {
    CompletableFuture<String> addNewVisitInDb(AddNewVisitModel visitModel);

    String handleBanVisitor(String visitorId, String reason);

    String handleBanUnVisitor(String visitorId);

    VisitorDto getVisitorDetailByContact(String visitorContact);

    VisitorDto getVisitorById(String visitorId);

    VisitorDto handleUpdateVisitorProfile(VisitorDoc visitorDoc);

    PageResponse<VisitorDto> searchVisitor(VisitorFilterInput filter,PaginationInput pagination);

    VisitingRecordPage visitsOfVisitor(String id, int pageNumber, int pageSize, String sortBy, String sortOrder);

    PageResponse<VisitingRecordWithVisitorInfo> search(VisitFilterInput filter, PaginationInput pagination);
}
