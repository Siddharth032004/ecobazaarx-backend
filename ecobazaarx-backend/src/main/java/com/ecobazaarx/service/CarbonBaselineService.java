package com.ecobazaarx.service;

import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class CarbonBaselineService {

    private static final Map<String, Double> BASE_VALUES = Map.of(
            "Eco-Friendly Groceries", 3.0,
            "Personal Care (Eco-Friendly)", 2.0,
            "Eco Kitchenware", 4.0,
            "Green Electronics", 8.0,
            "Eco-Home & Living", 6.0,
            "Sustainable Fashion", 5.0);

    private static final Double DEFAULT_BASELINE = 5.0;

    /**
     * Returns the baseline carbon footprint (kg CO2) for a given category.
     * If category is unknown or null, returns default value (5.0).
     */
    public Double getBaselineForCategory(String categoryName) {
        if (categoryName == null) {
            return DEFAULT_BASELINE;
        }
        return BASE_VALUES.getOrDefault(categoryName, DEFAULT_BASELINE);
    }
}
