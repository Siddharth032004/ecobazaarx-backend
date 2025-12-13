package com.ecobazaarx.repository;

import com.ecobazaarx.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

// This repository is for the CartItem entity, which uses Long as its primary key.
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Custom methods related to CartItem would go here if needed.
    // Based on your current service logic, no custom methods are required.
}