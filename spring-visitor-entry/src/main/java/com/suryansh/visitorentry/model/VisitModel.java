package com.suryansh.visitorentry.model;

import com.suryansh.visitorentry.entity.VisitingRecordDoc;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisitModel {
    private String visitorContact;
    private String visitorName;
    private String visitorImage;
    private Boolean hasChildrenInSchool;
    private boolean updateVisitorInfo;

    private BanStatus banStatus;
    // Visitor Address.
    private VisitorAddress visitorAddress;
    // Children
    private List<VisitorChildren> visitorChildren;
    private VisitingRecord visitingRecord;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VisitingRecord {
        private String reason;
        private String visitorHost;
        private VisitingRecordDoc.Status status;
        private String note;
    }
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
}
