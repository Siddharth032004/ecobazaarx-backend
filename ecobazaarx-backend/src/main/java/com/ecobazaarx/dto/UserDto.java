package com.ecobazaarx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private boolean enabled;
    private Double totalCarbonSaved;

    // Rewards fields
    private Double carbonPoints;
    private String currentLevel;
    private Double pointsToNextLevel;
}
