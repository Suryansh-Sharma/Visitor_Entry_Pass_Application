package com.suryansh.visitorentry.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "app_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationEntity {

    @Id
    private Integer id = 1;
    @Column(nullable = false)
    private String organizationName;
    private String organizationType;
    private String organizationAddress;
    private String organizationPhone;
    private String organizationEmail;
    private String logoPath;
}