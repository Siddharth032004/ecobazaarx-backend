package com.ecobazaarx.controller;

import com.ecobazaarx.dto.OrderItemDto;
import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seller")
@RequiredArgsConstructor
public class SellerController {
    private final SellerService sellerService;

    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getSellerProducts(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<ProductDto> products = sellerService.getSellerProducts(user.getId());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/stats")
    public ResponseEntity<com.ecobazaarx.dto.SellerDashboardDto> getSellerStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(sellerService.getSellerStats(user.getId()));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<com.ecobazaarx.dto.SellerOrderDto>> getSellerOrders(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(sellerService.getSellerOrdersList(user.getId()));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<com.ecobazaarx.dto.SellerOrderDto> getSellerOrderDetails(Authentication authentication,
            @org.springframework.web.bind.annotation.PathVariable Long id) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(sellerService.getSellerOrderDetails(user.getId(), id));
    }
}
