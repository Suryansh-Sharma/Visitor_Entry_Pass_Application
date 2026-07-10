package com.suryansh.visitorentry.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "visitors")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitorsEntity {
    @Id
    @UuidGenerator
    private String id;
    private String visitorContact;
    private String visitorName;
    private String visitorImage;
    // Not supplied when a visit is first logged (AddNewVisitModel has no such field) —
    // only set later during a profile update. Defaults to false so ModelMapper's
    // no-arg-constructed entity doesn't leave this null against the NOT NULL column.
    @Builder.Default
    private Boolean hasChildrenInSchool = false;
    private LocalDateTime lastVisitedOn;

    @Embedded
    private BanStatus banStatus;
    @Embedded
    private VisitorAddress visitorAddress;

    @OneToMany(mappedBy = "visitor", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 25)
    private List<VisitorsChild> visitorChildren = new ArrayList<>();

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BanStatus {
        @Column(name = "banned_on")
        private LocalDateTime bannedOn;
        @Column(name = "is_visitor_banned")
        private Boolean isVisitorBanned;
        @Column(name = "ban_reason")
        private String reason;
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisitorAddress {
        @Column(name = "address_city")
        private String city;
        @Column(name = "address_pin_code")
        private String pinCode;
        @Column(name = "address_line1")
        private String line1;
    }
}
