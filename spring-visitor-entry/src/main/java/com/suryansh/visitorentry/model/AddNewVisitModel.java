package com.suryansh.visitorentry.model;

import com.suryansh.visitorentry.entity.VisitingRecordDoc;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddNewVisitModel {
    private String visitorContact;
    private String visitorName;
    private String visitorImage;
    private List<VisitorChildren> visitorChildren;
    private VisitorAddress visitorAddress;
    private VisitingRecord visitingRecord;

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
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VisitingRecord {
        private String reason;
        private String visitorHost;
        private VisitingRecordDoc.Status status;
        private String note;
    }
}

