package com.ecobazaarx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDto {
    private Long userId;
    private String customerName;
    private Double totalCarbonSavedKg;
    private Double totalCarbonPoints;
    private String currentLevel;
    private Long ecoOrdersCount;
}
