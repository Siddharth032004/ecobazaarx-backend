package com.ecobazaarx.controller;

import com.ecobazaarx.entity.User;
import com.ecobazaarx.repository.CartRepository;
import com.ecobazaarx.repository.OrderRepository;
import com.ecobazaarx.repository.ProductRepository;
import com.ecobazaarx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/system")
@RequiredArgsConstructor
public class AdminSystemController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final com.ecobazaarx.repository.ReviewRepository reviewRepository;

    @DeleteMapping("/reset")
    @Transactional
    public ResponseEntity<String> resetSystem() {
        // 1. Delete all Carts (Foreign Key to User/Product)
        cartRepository.deleteAll();

        // 2. Delete all Orders (Foreign Key to User)
        orderRepository.deleteAll();

        // 3. Delete all Reviews (Foreign Key to User/Product)
        reviewRepository.deleteAll();

        // 4. Delete all Users except ADMINs
        List<User> usersToDelete = userRepository.findAll().stream()
                .filter(u -> !"ADMIN".equals(u.getRole()))
                .collect(Collectors.toList());

        userRepository.deleteAll(usersToDelete);

        // Optional: Reset Product Stock? The user said "start freshly with only admin
        // account".
        // Usually products are kept, but data related to customers (orders/carts) is
        // wiped.

        return ResponseEntity
                .ok("System reset successful. Deleted " + usersToDelete.size() + " users and all related data.");
    }
}
