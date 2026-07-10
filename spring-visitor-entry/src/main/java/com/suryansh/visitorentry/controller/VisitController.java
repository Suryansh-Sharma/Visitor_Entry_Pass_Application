package com.suryansh.visitorentry.controller;

import com.suryansh.visitorentry.dto.*;
import com.suryansh.visitorentry.entity.VisitorsEntity;
import com.suryansh.visitorentry.model.AddNewVisitModel;
import com.suryansh.visitorentry.service.interfaces.VisitorService;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.concurrent.CompletableFuture;

/**
 * This Controller class is responsible for handling visitor-related operation
 * Handles Http GraphQL request.
 *
 * @author suryansh
 */
@Controller
public class VisitController {
    private final VisitorService visitorService;

    public VisitController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public CompletableFuture<String> addNewVisit(@Argument("input") @Valid AddNewVisitModel addNewVisitModel) {
        return visitorService.addNewVisitInDb(addNewVisitModel);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public String banVisitor(@Argument String visitorId,@Argument String reason) {
        return visitorService.handleBanVisitor(visitorId,reason);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public String unBanStatus(@Argument String visitorId) {
        return visitorService.handleBanUnVisitor(visitorId);
    }

    /**
     * Get VisitorsEntity details by its contact no.
     *
     * @param visitorContact The visitor contact number.
     * @return The visitor details dto {@link VisitorDto}.
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public VisitorDto getVisitorByContact(@Argument String visitorContact){
        return visitorService.getVisitorDetailByContact(visitorContact);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public VisitorDto getVisitorById(@Argument String visitorId){
        return visitorService.getVisitorById(visitorId);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public VisitingRecordPage getVisitOfVisitor(@Argument String id, @Argument int page_size
            , @Argument int page_number, @Argument String sort_by, @Argument String sort_order) {
        return visitorService.visitsOfVisitor(id, page_number, page_size,sort_by,sort_order);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public VisitorDto updateVisitorInfo(@Argument("input") VisitorsEntity visitorDoc) {
        return visitorService.handleUpdateVisitorProfile(visitorDoc);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public PageResponse<VisitorDto> searchVisitor(@Argument VisitorFilterInput filter,@Argument PaginationInput pagination) {
        return visitorService.searchVisitor(filter,pagination);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public PageResponse<VisitingRecordWithVisitorInfo> visits(@Argument VisitFilterInput filter, @Argument PaginationInput pagination) {
        return visitorService.search(filter,pagination);
    }
}
