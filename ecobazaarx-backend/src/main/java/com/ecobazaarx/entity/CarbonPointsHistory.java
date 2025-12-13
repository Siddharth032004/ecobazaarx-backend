package com.ecobazaarx.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "carbon_points_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonPointsHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Long orderId; // Optional, link to order if applicable

    @Column(nullable = false)
    private Long pointsChange; // e.g. +315

    @Column(nullable = false)
    private String description; // e.g. "Earned from Order #7"

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
