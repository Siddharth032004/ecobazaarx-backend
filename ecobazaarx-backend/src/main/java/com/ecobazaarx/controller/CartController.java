package com.ecobazaarx.controller;

import com.ecobazaarx.dto.CartDto;
import com.ecobazaarx.dto.OrderDto;
import com.ecobazaarx.entity.Order;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.service.CartService;
import com.ecobazaarx.service.OrderService;
import com.ecobazaarx.util.MapperUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    private final OrderService orderService;

    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(@RequestBody AddToCartRequest body, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        var cart = cartService.addToCart(user.getId(), body.getProductId(), body.getQuantity());
        return ResponseEntity.ok(MapperUtil.toCartDto(cart));
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(cartService.getCartDto(user.getId()));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateItem(@PathVariable Long itemId, @RequestBody UpdateQuantityRequest req,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(cartService.updateItemQuantity(user.getId(), itemId, req.getQuantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeItem(@PathVariable Long itemId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(cartService.removeItem(user.getId(), itemId));
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderDto> checkout(@RequestBody CheckoutRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Order order = cartService.checkout(user.getId(), request.getShippingAddress(), request.getCouponCode());
        OrderDto orderDto = orderService.getOrderById(order.getId());
        return ResponseEntity.ok(orderDto);
    }

    @Data
    public static class AddToCartRequest {
        private Long productId;
        private Integer quantity;
    }

    @Data
    public static class CheckoutRequest {
        private com.ecobazaarx.entity.Address shippingAddress;
        private String couponCode;
    }

    @Data
    public static class UpdateQuantityRequest {
        private Integer quantity;
    }
}
