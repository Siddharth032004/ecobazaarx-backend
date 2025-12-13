package com.ecobazaarx.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_user_id", columnList = "userId"),
        @Index(name = "idx_order_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private Double totalCarbonSaved;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Embedded
    private Address shippingAddress;

    private String couponCode;
    @Builder.Default
    private Double discountAmount = 0.0;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private Set<OrderItem> items = new LinkedHashSet<>();
    @Builder.Default
    private Long carbonPointsEarned = 0L;

    @Builder.Default
    private boolean pointsCredited = false;
}
