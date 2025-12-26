package com.ecobazaarx.dto;

import java.util.List;

public class EcoInputs {
    private List<EcoInputItem> materials;
    private List<EcoInputItem> manufacturing;
    private List<EcoInputItem> packaging;

    public List<EcoInputItem> getMaterials() {
        return materials;
    }

    public void setMaterials(List<EcoInputItem> materials) {
        this.materials = materials;
    }

    public List<EcoInputItem> getManufacturing() {
        return manufacturing;
    }

    public void setManufacturing(List<EcoInputItem> manufacturing) {
        this.manufacturing = manufacturing;
    }

    public List<EcoInputItem> getPackaging() {
        return packaging;
    }

    public void setPackaging(List<EcoInputItem> packaging) {
        this.packaging = packaging;
    }

    public static class EcoInputItem {
        private String name;
        private double weight;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public double getWeight() {
            return weight;
        }

        public void setWeight(double weight) {
            this.weight = weight;
        }
    }
}
