package com.ecobazaarx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private Long id;
    private Long userId;
    private Double totalAmount;
    private Double totalCarbonSaved;
    private Long carbonPointsEarned;
    private String status;
    private LocalDateTime timestamp;
    private List<OrderItemDto> items;
}
