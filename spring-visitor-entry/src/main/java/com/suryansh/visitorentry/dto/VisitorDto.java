package com.suryansh.visitorentry.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * This class acts as a model and dto for addNewVisit, search, getTodayVisit etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitorDto {
    private String id;
    private String visitorContact;
    private String visitorName;
    private String visitorImage;

    private BanStatusDTO banStatus;

    // Visitor Address
    private VisitorAddressDTO visitorAddress;

    private boolean hasChildrenInSchool;
    private LocalDateTime lastVisitedOn;

    // Children
    private List<VisitorChildrenDTO> visitorChildren;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisitorChildrenDTO {
        private String name;
        private String standard;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisitorAddressDTO {
        private String line1; // Street address
        private String city;   // City name
        private String state;  // State name
        private String country; // Country name
        private String pinCode; // Postal code
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BanStatusDTO {
        private LocalDateTime bannedOn;
        private boolean isVisitorBanned;
        private String reason;
    }
}
