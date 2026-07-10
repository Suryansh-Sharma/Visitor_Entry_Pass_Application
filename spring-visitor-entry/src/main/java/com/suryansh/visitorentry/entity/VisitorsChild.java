package com.suryansh.visitorentry.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "visitor_children")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitorsChild {
    @Id
    @UuidGenerator
    private String id;
    private String name;
    private String standard;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visitor_id")
    private VisitorsEntity visitor;
}
