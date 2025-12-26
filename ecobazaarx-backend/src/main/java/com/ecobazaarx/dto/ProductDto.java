package com.ecobazaarx.dto;

import lombok.Data;

@Data
public class ProductDto {
  private Long id;
  private String name;
  private String categoryName;
  private String brand;
  private Double price;
  private Integer stockQuantity;
  private String imageUrl;
  private Double carbonFootprintPerUnit;
  private Double carbonSavedPerItem;
  private String sellerStoreName;
  private String slug;
  private Double mrp;
  private Double rating;
  private Integer discountPercent;
  private Boolean isFeatured;
  private java.util.List<String> images;
  private Double co2ComparisonPercentage;
  private String co2ComparisonType; // "LOWER", "SIMILAR", "NONE"
  private EcoInputs ecoInputs; // For input only, not persisted directly
  private String city;
  private String state;
}
