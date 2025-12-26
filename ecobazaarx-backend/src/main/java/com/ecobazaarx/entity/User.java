package com.ecobazaarx.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name; // full name

    @Column(nullable = false, unique = true)
    private String email; // email used for login

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password; // encrypted password

    @Column(nullable = false)
    private String role; // CUSTOMER, ADMIN, SELLER

    private String phone;

    @Builder.Default
    private boolean enabled = true;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Builder.Default
    private Double totalCarbonPoints = 0.0;

    @Builder.Default
    private Double availableCarbonPoints = 0.0;

    @Builder.Default
    private String currentLevel = "Eco Newbie";

    @Builder.Default
    private Integer totalEcoOrders = 0;
}
