package com.ecobazaarx.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category", indexes = {
        @Index(name = "idx_category_slug", columnList = "slug")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
}
