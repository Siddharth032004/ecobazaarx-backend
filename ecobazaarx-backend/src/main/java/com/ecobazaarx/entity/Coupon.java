package com.ecobazaarx.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "coupons", indexes = {
        @Index(name = "idx_coupon_user", columnList = "user_id"),
        @Index(name = "idx_coupon_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String description;

    // PERCENT, FIXED typically, but assuming PERCENT per requirements
    private String discountType; // "PERCENT"

    private Double discountValue;

    private Double minOrderValue;

    private LocalDate expiryDate;

    // ACTIVE, USED, EXPIRED
    @Builder.Default
    private String status = "ACTIVE";

    // To track which Level Reward this came from (e.g., 200, 500, 1000)
    // Helps ensure "one coupon per threshold"
    private Integer unlockThreshold;

    // Points required to claim this coupon (for manual redemption)
    private Integer pointsRequired;

    @Column(updatable = false)
    @Builder.Default
    private LocalDate createdAt = LocalDate.now();

    private LocalDate usedAt;

    private Long orderId; // track which order used this coupon
}
