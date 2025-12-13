package com.ecobazaarx.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // link to User.id (nullable for guest carts)

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private Set<CartItem> items = new LinkedHashSet<>();

    public Double getSubtotal() {
        double total = items.stream()
                .mapToDouble(i -> i.getProductPrice() * i.getQuantity())
                .sum();
        return BigDecimal.valueOf(total)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    public Double getSubtotalCarbonFootprint() {
        double total = items.stream()
                .mapToDouble(i -> i.getCarbonFootprintPerUnit() * i.getQuantity())
                .sum();
        return BigDecimal.valueOf(total)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

}
