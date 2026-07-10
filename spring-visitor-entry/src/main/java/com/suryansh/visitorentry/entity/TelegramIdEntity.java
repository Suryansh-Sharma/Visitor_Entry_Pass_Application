package com.suryansh.visitorentry.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "telegram_ids")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelegramIdEntity {
    @Id
    @UuidGenerator
    private String id;
    @Column(nullable = false)
    private String hostName;
    @Column(nullable = false, unique = true)
    private String chatId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UsersEntity.ROLE role;
    private LocalDateTime dateOfJoin;
}