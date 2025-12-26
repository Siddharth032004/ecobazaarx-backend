package com.ecobazaarx.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "product", indexes = {
    @Index(name = "idx_product_category", columnList = "categoryName"),
    @Index(name = "idx_product_price", columnList = "price"),
    @Index(name = "idx_product_featured", columnList = "isFeatured"),
    @Index(name = "idx_product_name", columnList = "name"),
    @Index(name = "idx_product_slug", columnList = "slug")
})
public class Product {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  private String categoryName;
  private String brand;
  private Double price;
  private Integer stockQuantity;
  @Column(columnDefinition = "TEXT")
  private String imageUrl;

  @Column(length = 1000)
  private String description;

  @Column(name = "sku")
  private String sku;

  /**
   * carbonFootprintPerUnit unit = kg CO2e per item
   */
  @Getter
  private Double carbonFootprintPerUnit;

  /**
   * Calculated field: Base Value (Category) - carbonFootprintPerUnit
   */
  @Getter
  private Double carbonSavedPerItem;

  private String slug;
  private Double mrp;
  private Double rating;
  private Integer discountPercent;
  private Boolean isFeatured;

  @ElementCollection
  @Column(columnDefinition = "TEXT")
  private java.util.List<String> images;

  @Deprecated
  private String sellerStoreName; // Keep for backward compatibility, but prefer seller relationship

  private String city;
  private String state;

  @ManyToOne
  @JoinColumn(name = "seller_id")
  private User seller; // Link to User entity (SELLER role)
}
