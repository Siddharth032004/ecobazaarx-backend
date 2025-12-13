package com.ecobazaarx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerDashboardDto {
    private Long totalProducts;
    private Long totalStock;
    private Long totalOrders; // Orders containing this seller's products
    private Double totalRevenue; // Sum of this seller's share of orders
    private Double totalCo2Saved; // From this seller's sold items
}
