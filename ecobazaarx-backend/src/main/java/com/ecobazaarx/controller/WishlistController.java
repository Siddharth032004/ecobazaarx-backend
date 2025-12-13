package com.ecobazaarx.controller;

import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.entity.Wishlist;
import com.ecobazaarx.service.WishlistService;
import com.ecobazaarx.util.MapperUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemDto>> getWishlist(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Wishlist> items = wishlistService.getWishlist(user.getId());
        List<WishlistItemDto> dtos = items.stream()
                .map(item -> new WishlistItemDto(item.getId(), MapperUtil.toProductDto(item.getProduct())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<String> addToWishlist(@PathVariable Long productId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        wishlistService.addToWishlist(user.getId(), productId);
        return ResponseEntity.ok("Added to wishlist");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> removeFromWishlist(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        wishlistService.removeFromWishlist(user.getId(), id);
        return ResponseEntity.ok("Removed from wishlist");
    }

    @Data
    @RequiredArgsConstructor
    public static class WishlistItemDto {
        private final Long id;
        private final ProductDto product;
    }
}
