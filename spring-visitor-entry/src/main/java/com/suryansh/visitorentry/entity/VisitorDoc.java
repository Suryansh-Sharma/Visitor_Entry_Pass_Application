package com.suryansh.visitorentry.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * This is MongoDb document class that stores visit in a database.
 *  This is mainly used for visit's activities.
 */
@Document("Visitor_Document")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitorDoc {
    @Id
    private String id;
    private String visitorContact;
    private String visitorName;
    private String visitorImage;
    private Boolean hasChildrenInSchool;
    private LocalDateTime lastVisitedOn;
    // Ban Status
    private BanStatus banStatus;
    // Visitor Address.
    private VisitorAddress visitorAddress;
    // Children
    private List<VisitorChildren> visitorChildren;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VisitorChildren {
        private String name;
        private String standard;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VisitorAddress {
        private String city;
        private String pinCode;
        private String line1;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BanStatus {
        private LocalDateTime bannedOn;
        private Boolean isVisitorBanned;
        private String reason;
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VisitorDoc that)) return false;
        return Objects.equals(visitorContact, that.visitorContact) &&
                Objects.equals(visitorName, that.visitorName) &&
                Objects.equals(visitorImage, that.visitorImage) &&
                Objects.equals(hasChildrenInSchool, that.hasChildrenInSchool) &&
                Objects.equals(lastVisitedOn, that.lastVisitedOn) &&
                Objects.equals(banStatus, that.banStatus) &&
                Objects.equals(visitorAddress, that.visitorAddress) &&
                Objects.equals(visitorChildren, that.visitorChildren);
    }

    @Override
    public int hashCode() {
        return Objects.hash( visitorContact, visitorName, visitorImage, hasChildrenInSchool, lastVisitedOn, banStatus, visitorAddress, visitorChildren);
    }
}