package com.ecobazaarx.service;

import com.ecobazaarx.dto.EcoInputs;
import com.ecobazaarx.dto.EcoInputs.EcoInputItem;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CarbonCalculator {

    private static final Map<String, Double> MATERIAL_FACTORS = new HashMap<>();
    private static final Map<String, Double> MFG_FACTORS = new HashMap<>();
    private static final Map<String, Double> PACKAGING_FACTORS = new HashMap<>();

    static {
        // Materials (kg CO2e per kg)
        MATERIAL_FACTORS.put("Raw Cotton", 5.92);
        MATERIAL_FACTORS.put("Polyester", 5.5);
        MATERIAL_FACTORS.put("Organic Cotton", 3.8);
        MATERIAL_FACTORS.put("Recycled Polyester", 2.1);
        MATERIAL_FACTORS.put("Nylon", 7.3);
        MATERIAL_FACTORS.put("Wool", 20.0);
        MATERIAL_FACTORS.put("Silk", 25.0);
        MATERIAL_FACTORS.put("Leather", 30.0);
        MATERIAL_FACTORS.put("Denim", 6.0);
        MATERIAL_FACTORS.put("Linen", 4.5);
        MATERIAL_FACTORS.put("Hemp", 3.5);
        MATERIAL_FACTORS.put("Bamboo", 3.0);
        MATERIAL_FACTORS.put("Viscose", 4.2);
        MATERIAL_FACTORS.put("Tencel", 3.8);

        // New Generic Material Options
        MATERIAL_FACTORS.put("Other – Textile", 6.5);
        MATERIAL_FACTORS.put("Other – Plastic", 7.0);
        MATERIAL_FACTORS.put("Other – Natural Material", 4.5);
        MATERIAL_FACTORS.put("Other – Synthetic Material", 6.8);

        // Manufacturing (kg CO2e per kg processed)
        MFG_FACTORS.put("Yarn Spinning", 3.0);
        MFG_FACTORS.put("Weaving", 4.0);
        MFG_FACTORS.put("Knitting", 3.5);
        MFG_FACTORS.put("Dyeing", 4.0);
        MFG_FACTORS.put("Printing", 2.5);
        MFG_FACTORS.put("Cut & Sew", 1.0);
        MFG_FACTORS.put("Finishing", 1.5);
        MFG_FACTORS.put("Washing", 0.8);
        MFG_FACTORS.put("Embroidery", 1.2);
        MFG_FACTORS.put("Assembly", 0.5);

        // New Generic Manufacturing Option
        MFG_FACTORS.put("Other – Generic Manufacturing", 3.0);

        // Packaging (kg CO2e per kg)
        PACKAGING_FACTORS.put("Plastic Bag", 2.0);
        PACKAGING_FACTORS.put("Cardboard Box", 0.9);
        PACKAGING_FACTORS.put("Paper Wrap", 0.5);
        PACKAGING_FACTORS.put("Jute Bag", 0.3);
        PACKAGING_FACTORS.put("Biodegradable Plastic", 1.2);
        PACKAGING_FACTORS.put("Recycled Paper", 0.6);
        PACKAGING_FACTORS.put("Bubble Wrap", 2.5);

        // New Generic Packaging Option
        PACKAGING_FACTORS.put("Other – Generic Packaging", 1.5);
    }

    public double calculateFootprint(EcoInputs inputs) {
        if (inputs == null)
            return 0.0;

        double total = 0.0;

        // Calculate Materials
        if (inputs.getMaterials() != null) {
            for (EcoInputItem item : inputs.getMaterials()) {
                total += calculateItem(item, MATERIAL_FACTORS);
            }
        }

        // Calculate Manufacturing
        if (inputs.getManufacturing() != null) {
            for (EcoInputItem item : inputs.getManufacturing()) {
                total += calculateItem(item, MFG_FACTORS);
            }
        }

        // Calculate Packaging
        if (inputs.getPackaging() != null) {
            for (EcoInputItem item : inputs.getPackaging()) {
                total += calculateItem(item, PACKAGING_FACTORS);
            }
        }

        return total;
    }

    private double calculateItem(EcoInputItem item, Map<String, Double> factors) {
        if (item == null || item.getName() == null)
            return 0.0;
        Double factor = factors.get(item.getName());
        if (factor == null)
            return 0.0; // Ignore unknown items
        return item.getWeight() * factor;
    }
}
