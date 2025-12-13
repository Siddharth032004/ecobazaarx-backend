package com.ecobazaarx.controller;

import com.ecobazaarx.entity.CarbonPointsHistory;
import com.ecobazaarx.entity.Coupon;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.entity.UserBadge;
import com.ecobazaarx.repository.UserRepository;
import com.ecobazaarx.service.RewardsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
public class RewardsController {

    private final RewardsService rewardsService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getRewardsSummary() {
        User user = getAuthenticatedUser();

        // Sync points from orders to fix any inconsistencies
        rewardsService.syncUserPoints(user);

        // REFRESH user to get updated points
        user = userRepository.findById(user.getId()).orElse(user);

        Map<String, Object> response = new HashMap<>();

        Double totalPoints = user.getTotalCarbonPoints() != null ? user.getTotalCarbonPoints() : 0.0;
        Double availablePoints = user.getAvailableCarbonPoints() != null ? user.getAvailableCarbonPoints()
                : (user.getTotalCarbonPoints() != null ? user.getTotalCarbonPoints() : 0.0);

        Integer totalOrders = user.getTotalEcoOrders() != null ? user.getTotalEcoOrders() : 0;
        String level = user.getCurrentLevel() != null ? user.getCurrentLevel() : "Seedling";

        response.put("totalCarbonPoints", totalPoints); // Lifetime
        response.put("availableCarbonPoints", availablePoints); // Spendable
        response.put("currentLevel", level);
        response.put("totalEcoOrders", totalOrders);

        response.put("totalCarbonSavedKg", totalPoints / 10.0);

        double nextLevelAt = rewardsService.getPointsForNextLevel(totalPoints);
        response.put("nextLevelAt", nextLevelAt);

        // Progress percentage for LEVELS only (based on LIFETIME points)
        double prevLevelAt = 0;

        if (totalPoints >= 1000)
            prevLevelAt = 1000;
        else if (totalPoints >= 500)
            prevLevelAt = 500;
        else if (totalPoints >= 200)
            prevLevelAt = 200;

        double progress = 100;
        if (nextLevelAt > 0) {
            progress = ((totalPoints - prevLevelAt) / (nextLevelAt - prevLevelAt)) * 100;
            if (progress > 100)
                progress = 100;
            if (progress < 0)
                progress = 0;
        }
        response.put("progressToNextLevel", progress);

        List<UserBadge> badges = rewardsService.getUserBadges(user.getId());
        response.put("badges", badges);

        List<Coupon> allCoupons = rewardsService.getUserCoupons(user);
        List<Coupon> activeRewards = allCoupons.stream()
                .filter(c -> "UNUSED".equalsIgnoreCase(c.getStatus()))
                .toList();
        List<Coupon> usedRewards = allCoupons.stream()
                .filter(c -> !"UNUSED".equalsIgnoreCase(c.getStatus())) // USED or EXPIRED
                .toList();

        response.put("activeRewards", activeRewards);
        response.put("usedRewards", usedRewards);

        // NEW: Dynamic Rewards List with Status
        List<Map<String, Object>> rewardsList = java.util.Arrays.asList(
                createRewardEntry("ECO5", "5% OFF", 500, totalPoints),
                createRewardEntry("ECO10", "10% OFF", 1000, totalPoints),
                createRewardEntry("ECO15", "15% OFF", 2000, totalPoints));
        response.put("rewards", rewardsList);

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createRewardEntry(String code, String name, int threshold, double currentPoints) {
        Map<String, Object> map = new HashMap<>();
        map.put("code", code);
        map.put("name", name);
        map.put("threshold", threshold);
        boolean unlocked = currentPoints >= threshold;
        map.put("unlocked", unlocked);
        if (!unlocked) {
            map.put("pointsNeeded", threshold - currentPoints);
        }
        return map;
    }

    // Deprecated: Rewards are now unlocked automatically
    @PostMapping("/redeem")
    public ResponseEntity<Map<String, Object>> redeemReward(@RequestBody Map<String, String> payload) {
        return ResponseEntity.badRequest().body(Map.of("message",
                "Manual redemption is disabled. Rewards are unlocked automatically based on points."));
    }

    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getCoupons() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(rewardsService.getUserCoupons(user));
    }

    @PostMapping("/apply-coupon")
    public ResponseEntity<Map<String, Object>> applyCoupon(@RequestBody Map<String, Object> payload) {
        try {
            User user = getAuthenticatedUser();
            String code = (String) payload.get("couponCode");
            Object orderAmountObj = payload.get("orderAmount");
            Double orderAmount = Double.valueOf(orderAmountObj.toString());

            Coupon coupon = rewardsService.validateCoupon(code, user, orderAmount);

            Map<String, Object> response = new HashMap<>();
            response.put("isValid", true);
            response.put("discountType", coupon.getDiscountType());
            response.put("discountValue", coupon.getDiscountValue());

            double discountAmount = 0;
            if ("PERCENT".equals(coupon.getDiscountType())) {
                discountAmount = (orderAmount * coupon.getDiscountValue()) / 100.0;
            } else {
                discountAmount = coupon.getDiscountValue();
            }

            if (discountAmount > orderAmount)
                discountAmount = orderAmount;

            response.put("discountAmount", discountAmount);
            response.put("finalPayableAmount", orderAmount - discountAmount);
            response.put("couponCode", coupon.getCode());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
