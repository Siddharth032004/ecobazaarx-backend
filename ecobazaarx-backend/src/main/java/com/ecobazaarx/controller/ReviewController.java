package com.ecobazaarx.controller;

import com.ecobazaarx.entity.Review;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.service.ReviewService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody AddReviewRequest req, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(reviewService.addReview(user.getId(), req.getProductId(), req.getRating(), req.getComment()));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @Data
    public static class AddReviewRequest {
        private Long productId;
        private int rating;
        private String comment;
    }
}
