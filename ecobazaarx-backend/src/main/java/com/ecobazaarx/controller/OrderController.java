package com.ecobazaarx.controller;

import com.ecobazaarx.dto.OrderDto;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<OrderDto>> getUserOrders(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "5") int size) {
        User user = (User) authentication.getPrincipal();
        org.springframework.data.domain.Page<OrderDto> orderPage = orderService.getUserOrdersPaginated(user.getId(),
                page, size);
        return ResponseEntity.ok(orderPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        OrderDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }
}
