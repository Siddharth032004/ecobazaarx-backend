package com.ecobazaarx.service;

import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.entity.Wishlist;
import com.ecobazaarx.repository.ProductRepository;
import com.ecobazaarx.repository.UserRepository;
import com.ecobazaarx.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<Wishlist> getWishlist(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return wishlistRepository.findByUser(user);
    }

    @Transactional
    public void addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (wishlistRepository.findByUserAndProductId(user, productId).isPresent()) {
            return; // Already in wishlist
        }
        Product product = productRepository.findById(productId).orElseThrow();
        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();
        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long wishlistId) {
        // Ensure the wishlist item belongs to the user
        Wishlist wishlist = wishlistRepository.findById(wishlistId).orElseThrow();
        if (!wishlist.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        wishlistRepository.delete(wishlist);
    }
}
