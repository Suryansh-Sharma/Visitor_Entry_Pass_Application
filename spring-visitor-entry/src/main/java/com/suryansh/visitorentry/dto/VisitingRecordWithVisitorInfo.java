package com.suryansh.visitorentry.dto;

import com.suryansh.visitorentry.entity.VisitingRecordDoc;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisitingRecordWithVisitorInfo {
    private String id;
    private Instant visitedOn;
    private String reason;
    private String visitorHost;
    private VisitingRecordDoc.Status status;
    private String note;
    private VisitorInfo visitorInfo;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VisitorInfo{
        private String id;
        private String visitorContact;
        private String visitorName;
        private String visitorImage;
    }
}
