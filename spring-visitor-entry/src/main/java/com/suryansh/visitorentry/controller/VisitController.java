package com.suryansh.visitorentry.controller;

import com.suryansh.visitorentry.dto.PaginationDto;
import com.suryansh.visitorentry.dto.VisitingRecordPage;
import com.suryansh.visitorentry.dto.VisitorDto;
import com.suryansh.visitorentry.entity.VisitorDoc;
import com.suryansh.visitorentry.model.SearchFilter;
import com.suryansh.visitorentry.model.VisitModel;
import com.suryansh.visitorentry.service.interfaces.VisitorService;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.List;
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

    /**
     * Add a new visit to the database.
     *
     * @param visitModel The visit data to be added.
     * @return A completableFuture representing the asynchronous result of adding a visit dto {@link VisitorDto}.
     */
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public CompletableFuture<String> addNewVisit(@Argument("input") @Valid VisitModel visitModel) {
        return visitorService.addNewVisitInDb(visitModel);
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
     * Get Visitor details by its contact no.
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
    public VisitorDto updateVisitorInfo(@Argument("input") VisitorDoc visitorDoc) {
        return visitorService.handleUpdateVisitorProfile(visitorDoc);
    }

    /**
     * This api is just for test, It retrieves all visitors on a specific date.
     *
     * @param date        The date in format "yyyy-MM-dd".
     * @param page_size   pass page-size for pagination.
     * @param page_number pass page-number.
     * @return A PaginationDto {@link PaginationDto} object containing the page size, page number, list of visits, total pages, and total data.
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    @Cacheable(value = "visitsOnSpecificDate", key = " #date.toString() + #page_size + #page_number  + #sort_by + #sort_order")
    public PaginationDto getVisitorOnSpecificDate(@Argument LocalDate date, @Argument int page_size
            , @Argument int page_number, @Argument String sort_by, @Argument String sort_order) {
        return visitorService.getVisitorOnSpecificDate(date, page_size, page_number, sort_by, sort_order);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public VisitingRecordPage searchVisitor(@Argument List<SearchFilter> filters, @Argument int pageSize
            , @Argument int pageNumber, @Argument String sort_by, @Argument String sort_order) {
        return visitorService.searchVisitor(filters, pageSize, pageNumber, sort_by, sort_order);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public PaginationDto getVisitorsOnPeriod(@Argument String from_date, @Argument String to_date, @Argument int page_size
            , @Argument int page_number, @Argument String sort_by,
                                             @Argument String sort_order) {
        return visitorService.handleGetVisitorsInPeriod(from_date, to_date,page_size,page_number, sort_by, sort_order);
    }

}
