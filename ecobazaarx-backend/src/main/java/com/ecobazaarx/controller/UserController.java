package com.ecobazaarx.controller;

import com.ecobazaarx.dto.UserDto;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final com.ecobazaarx.repository.OrderRepository orderRepository;
    private final com.ecobazaarx.service.RewardsService rewardsService; // Inject RewardsService

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Double saved = orderRepository.sumTotalCarbonSavedByUserId(user.getId());
        System.out.println(
                "DEBUG: User ID " + user.getId() + " - Saved: " + saved + " - Points: " + user.getTotalCarbonPoints());

        // Ensure points are synced
        rewardsService.syncUserPoints(user);

        // Calculate points to next level for response
        double currentPoints = user.getTotalCarbonPoints() != null ? user.getTotalCarbonPoints() : 0.0;
        double nextLevelAt = rewardsService.getPointsForNextLevel(currentPoints);
        double pointsToNext = nextLevelAt > 0 ? (nextLevelAt - currentPoints) : 0;

        return ResponseEntity.ok(UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getName())
                .role(user.getRole())
                .totalCarbonSaved(saved != null ? saved : 0.0)
                .carbonPoints(currentPoints)
                .currentLevel(user.getCurrentLevel())
                .pointsToNextLevel(pointsToNext)
                .build());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        user.setName(request.getFullName());
        userRepository.save(user);
        return ResponseEntity.ok(UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getName())
                .role(user.getRole())
                .build());
    }

    @lombok.Data
    public static class UpdateProfileRequest {
        private String fullName;
    }
}
