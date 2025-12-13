package com.ecobazaarx.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String badgeCode; // e.g. FIRST_ECO_ORDER

    @Column(updatable = false)
    @Builder.Default
    private LocalDate awardedAt = LocalDate.now();
    
    private String icon; // Optional: leaf, trophy, etc.
    private String label; // Optional: Human readable name
}
