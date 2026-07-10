package com.suryansh.visitorentry.service.interfaces;

import com.suryansh.visitorentry.entity.OrganizationEntity;
import com.suryansh.visitorentry.model.OrganizationModel;

import java.util.Optional;

public interface OrganizationService {
    Optional<OrganizationEntity> getOrganization();

    OrganizationEntity saveOrganization(OrganizationModel model);
}
