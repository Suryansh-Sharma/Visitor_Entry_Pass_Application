package com.suryansh.visitorentry.controller;

import com.suryansh.visitorentry.entity.OrganizationEntity;
import com.suryansh.visitorentry.model.OrganizationModel;
import com.suryansh.visitorentry.service.interfaces.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
public class OrganizationController {
    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public OrganizationEntity getOrganization() {
        return organizationService.getOrganization().orElse(null);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public OrganizationEntity updateOrganization(@Argument("input") @Valid OrganizationModel input) {
        return organizationService.saveOrganization(input);
    }
}
