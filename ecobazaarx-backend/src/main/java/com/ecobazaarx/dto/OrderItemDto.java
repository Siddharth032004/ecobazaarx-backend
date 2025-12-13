package com.ecobazaarx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private Double price;
    private Integer quantity;
    private Double carbonFootprintPerUnit;
    private Double carbonSavedPerItem;
    private Long sellerId;
}
