package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.entity.OrganizationEntity;
import com.suryansh.visitorentry.model.OrganizationModel;
import com.suryansh.visitorentry.repository.OrganizationRepository;
import com.suryansh.visitorentry.service.interfaces.OrganizationService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrganizationServiceImpl implements OrganizationService {
    private static final Integer SINGLETON_ID = 1;
    private final OrganizationRepository organizationRepository;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Override
    public Optional<OrganizationEntity> getOrganization() {
        return organizationRepository.findById(SINGLETON_ID);
    }

    @Override
    public OrganizationEntity saveOrganization(OrganizationModel model) {
        OrganizationEntity organization = organizationRepository.findById(SINGLETON_ID)
                .orElseGet(() -> {
                    OrganizationEntity entity = new OrganizationEntity();
                    entity.setId(SINGLETON_ID);
                    return entity;
                });
        organization.setOrganizationName(model.getOrganizationName());
        organization.setOrganizationType(model.getOrganizationType());
        organization.setOrganizationAddress(model.getOrganizationAddress());
        organization.setOrganizationPhone(model.getOrganizationPhone());
        organization.setOrganizationEmail(model.getOrganizationEmail());
        organization.setLogoPath(model.getLogoPath());
        return organizationRepository.save(organization);
    }
}
