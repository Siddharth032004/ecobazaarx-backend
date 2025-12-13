package com.ecobazaarx.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class CartItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "cart_id")
  private Cart cart;

  @Getter
  private Long productId;
  @Getter
  private String productName;
  @Getter
  private double productPrice;
  @Getter
  private int quantity;
  @Getter
  private double carbonFootprintPerUnit;
  @Getter
  private Double carbonSavedPerItem;
  @Getter
  private String imageUrl;
}
