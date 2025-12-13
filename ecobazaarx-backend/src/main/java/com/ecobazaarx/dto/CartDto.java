package com.ecobazaarx.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartDto {
    private Long id;
    private Long userId;
    private List<CartItemDto> items;
    private Double subtotal;                // total price
    private Double subtotalCarbonFootprint; // total carbon (kg CO2e)
}
