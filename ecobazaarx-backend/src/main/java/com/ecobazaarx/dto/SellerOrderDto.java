package com.ecobazaarx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerOrderDto {
    private Long orderId;
    private LocalDateTime orderDate;
    private String status;
    private String customerName;
    private String customerEmail;

    // Seller specific aggregations
    private Integer itemsCount;
    private Double totalAmount; // For this seller only
    private Double totalCo2Saved; // For this seller only

    // Items belonging to this seller in this order
    private List<SellerOrderItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerOrderItemDto {
        private String productName;
        private Double pricePerUnit;
        private Integer quantity;
        private Double subtotal;
        private Double co2Saved;
        private String imageUrl;
    }
}
