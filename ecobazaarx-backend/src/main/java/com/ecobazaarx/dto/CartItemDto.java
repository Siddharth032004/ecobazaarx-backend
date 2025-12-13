package com.ecobazaarx.dto;

import lombok.Data;

@Data
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private Double productPrice;
    private Integer quantity;
    private Double carbonFootprintPerUnit;
    private Double carbonSavedPerItem;
    private Double subtotal; // productPrice * quantity
    private String imageUrl;
    private Double subtotalCarbonFootprint; // carbonFootprintPerUnit * quantity
    private Double subtotalCarbonSaved; // carbonSavedPerItem * quantity
    private Integer availableStock;
}
