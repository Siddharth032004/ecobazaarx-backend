package com.ecobazaarx.service;

import com.ecobazaarx.entity.CarbonPointsHistory;
import com.ecobazaarx.entity.Coupon;
import com.ecobazaarx.entity.Order;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.entity.UserBadge;
import com.ecobazaarx.repository.CarbonPointsHistoryRepository;
import com.ecobazaarx.repository.CouponRepository;
import com.ecobazaarx.repository.UserBadgeRepository;
import com.ecobazaarx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RewardsService {

    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final CarbonPointsHistoryRepository carbonPointsHistoryRepository;
    private final com.ecobazaarx.repository.OrderRepository orderRepository;

    // --- Core Calculation Logic ---

    public long calculatePoints(double carbonSavedKg) {
        return Math.round(carbonSavedKg * 10);
    }

    public String calculateLevel(double totalPoints) {
        if (totalPoints >= 2000)
            return "Earth Legend";
        if (totalPoints >= 1000)
            return "Planet Guardian";
        if (totalPoints >= 500)
            return "Carbon Hero";
        if (totalPoints >= 200)
            return "Green Explorer";
        return "Eco Starter";
    }

    @Transactional
    public void syncUserPoints(User user) {
        Double totalSaved = orderRepository.sumTotalCarbonSavedByUserId(user.getId());
        long expectedPoints = totalSaved != null ? calculatePoints(totalSaved) : 0;

        double currentPoints = user.getTotalCarbonPoints() != null ? user.getTotalCarbonPoints() : 0.0;

        if (Math.abs(currentPoints - expectedPoints) > 1) {
            user.setTotalCarbonPoints((double) expectedPoints);
            user.setCurrentLevel(calculateLevel(expectedPoints));
            userRepository.save(user);
            checkAndUnlockRewards(user);
        }
    }

    // --- Order Processing ---

    @Transactional
    public void processOrderRewards(Order order, User user) {
        if (order.isPointsCredited()) {
            return;
        }

        // 1. Calculate and Add Points
        long pointsEarned = calculatePoints(order.getTotalCarbonSaved());
        order.setCarbonPointsEarned(pointsEarned);
        order.setPointsCredited(true);

        double newTotalPoints = (user.getTotalCarbonPoints() != null ? user.getTotalCarbonPoints() : 0.0)
                + pointsEarned;
        user.setTotalCarbonPoints(newTotalPoints);

        // Also update available points (Balance)
        double currentAvailable = user.getAvailableCarbonPoints() != null ? user.getAvailableCarbonPoints() : 0.0;
        user.setAvailableCarbonPoints(currentAvailable + pointsEarned);

        user.setTotalEcoOrders((user.getTotalEcoOrders() != null ? user.getTotalEcoOrders() : 0) + 1);

        // 1a. Save History (Earned)
        CarbonPointsHistory earnedHistory = CarbonPointsHistory.builder()
                .userId(user.getId())
                .orderId(order.getId())
                .pointsChange(pointsEarned)
                .description("Earned from Order #" + order.getId())
                .build();
        carbonPointsHistoryRepository.save(earnedHistory);

        // 2. Update Level based on LIFETIME points
        String newLevel = calculateLevel(newTotalPoints);
        user.setCurrentLevel(newLevel);

        userRepository.save(user);

        // 3. Unlock Rewards Automatically
        checkAndUnlockRewards(user);

        // 4. Check for Badges
        checkAndIssueBadges(user, order);
    }

    // --- Manual Redemption Logic ---

    // --- Automatic Unlock Logic ---

    @Transactional
    public void checkAndUnlockRewards(User user) {
        double totalPoints = user.getTotalCarbonPoints() != null ? user.getTotalCarbonPoints() : 0.0;

        // 500 Points -> ECO5 (5% OFF)
        if (totalPoints >= 500) {
            unlockCouponIfNotExists(user, 500, "ECO5", 5.0, 200.0, "Unlocked at 500 points (5% OFF)");
        }

        // 1000 Points -> ECO10 (10% OFF)
        if (totalPoints >= 1000) {
            unlockCouponIfNotExists(user, 1000, "ECO10", 10.0, 500.0, "Unlocked at 1000 points (10% OFF)");
        }

        // 2000 Points -> ECO15 (15% OFF)
        if (totalPoints >= 2000) {
            unlockCouponIfNotExists(user, 2000, "ECO15", 15.0, 1000.0, "Unlocked at 2000 points (15% OFF)");
        }
    }

    private void unlockCouponIfNotExists(User user, int threshold, String code, double discount, double minOrder,
            String description) {
        // Check if user already got this reward level (Active or Used or Expired)
        boolean alreadyUnlocked = couponRepository.findByUser(user).stream()
                .anyMatch(c -> c.getCode().equals(code));

        if (!alreadyUnlocked) {
            // Create Coupon
            Coupon coupon = Coupon.builder()
                    .code(code)
                    .user(user)
                    .discountType("PERCENT")
                    .discountValue(discount)
                    .minOrderValue(minOrder)
                    .expiryDate(LocalDate.now().plusDays(60)) // Expires in 60 days
                    .status("UNUSED")
                    .unlockThreshold(threshold)
                    .description(description)
                    .build();

            couponRepository.save(coupon);

            // Log History
            CarbonPointsHistory history = CarbonPointsHistory.builder()
                    .userId(user.getId())
                    .pointsChange(0L) // No points deduction
                    .description("Reward Unlocked: " + code + " (" + (int) discount + "% OFF)")
                    .build();
            carbonPointsHistoryRepository.save(history);
        }
    }

    private void checkAndIssueBadges(User user, Order currentOrder) {
        int ecoOrders = user.getTotalEcoOrders() != null ? user.getTotalEcoOrders() : 0;
        double totalPoints = user.getTotalCarbonPoints() != null ? user.getTotalCarbonPoints() : 0.0;

        // Badge: FIRST_ECO_ORDER
        if (ecoOrders == 1) {
            awardBadge(user, "FIRST_ECO_ORDER", "First Eco Order", "leaf");
        }
        // Badge: 10_ECO_ORDERS
        if (ecoOrders == 10) {
            awardBadge(user, "10_ECO_ORDERS", "Eco Enthusiast", "shopping-bag");
        }
        // Badge: 100_KG_SAVED
        if (totalPoints / 10 >= 100) {
            awardBadge(user, "100_KG_SAVED", "100kg Saver", "cloud-lightning");
        }

        // Badge: 500_POINTS
        if (totalPoints >= 500) {
            awardBadge(user, "500_POINTS", "500 Points Club", "star");
        }
    }

    private void awardBadge(User user, String code, String label, String icon) {
        if (!userBadgeRepository.existsByUserIdAndBadgeCode(user.getId(), code)) {
            UserBadge badge = UserBadge.builder()
                    .userId(user.getId())
                    .badgeCode(code)
                    .label(label)
                    .icon(icon)
                    .build();
            userBadgeRepository.save(badge);
        }
    }

    // --- Coupon Consumption ---

    public Coupon validateCoupon(String code, User user, double orderAmount) {
        List<Coupon> userCoupons = couponRepository.findByUser(user);

        Coupon coupon = userCoupons.stream()
                .filter(c -> c.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid coupon code or does not belong to you"));

        if (!"UNUSED".equalsIgnoreCase(coupon.getStatus()) && !"ACTIVE".equalsIgnoreCase(coupon.getStatus())) {
            throw new RuntimeException("Coupon is " + coupon.getStatus());
        }
        if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
            coupon.setStatus("EXPIRED");
            couponRepository.save(coupon);
            throw new RuntimeException("Coupon has expired");
        }
        if (orderAmount < coupon.getMinOrderValue()) {
            throw new RuntimeException("Order amount must be at least " + coupon.getMinOrderValue());
        }

        return coupon;
    }

    @Transactional
    public void markCouponUsed(Coupon coupon) {
        coupon.setStatus("USED");
        coupon.setUsedAt(LocalDate.now());
        couponRepository.save(coupon);
    }

    // --- Data Access ---

    public List<UserBadge> getUserBadges(Long userId) {
        return userBadgeRepository.findByUserId(userId);
    }

    public List<Coupon> getUserCoupons(User user) {
        return couponRepository.findByUser(user);
    }

    public double getPointsForNextLevel(double totalLifetimePoints) {
        if (totalLifetimePoints < 200)
            return 200;
        if (totalLifetimePoints < 500)
            return 500;
        if (totalLifetimePoints < 1000)
            return 1000;
        if (totalLifetimePoints < 2000)
            return 2000;
        return 0; // Earth Legend (Max)
    }

    public List<CarbonPointsHistory> getPointsHistory(Long userId) {
        return carbonPointsHistoryRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
