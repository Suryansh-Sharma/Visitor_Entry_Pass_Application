package com.suryansh.visitorentry.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * This model class is used for creating/updating organization details.
 */
@Data
public class OrganizationModel {
    @NotBlank(message = "Organization name can't be blank")
    private String organizationName;
    private String organizationType;
    private String organizationAddress;
    private String organizationPhone;
    private String organizationEmail;
    private String logoPath;
}
