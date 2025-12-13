package com.ecobazaarx.service;

import com.ecobazaarx.entity.CarbonPointsHistory;
import com.ecobazaarx.entity.Coupon;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.repository.CarbonPointsHistoryRepository;
import com.ecobazaarx.repository.CouponRepository;
import com.ecobazaarx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final CarbonPointsHistoryRepository carbonPointsHistoryRepository;

    @Transactional
    public Map<String, Object> claimCoupon(Long userId, String discountType, Double discountValue,
            Integer pointsRequired,
            Double minOrderValue) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Idempotency / Double-claim check
        boolean alreadyHasCoupon = couponRepository.findByUser(user).stream()
                .anyMatch(c -> "UNUSED".equals(c.getStatus())
                        && c.getDiscountValue().equals(discountValue)
                        && c.getMinOrderValue().equals(minOrderValue));

        if (alreadyHasCoupon) {
            throw new IllegalStateException("You already have an active unused coupon of this type.");
        }

        Double currentPoints = user.getAvailableCarbonPoints() != null ? user.getAvailableCarbonPoints() : 0.0;

        if (currentPoints < pointsRequired) {
            throw new IllegalArgumentException("Insufficient points. You need " + pointsRequired + " points.");
        }

        // Deduct Points
        Double updatedPoints = currentPoints - pointsRequired;
        user.setAvailableCarbonPoints(updatedPoints);
        userRepository.save(user);

        // Generate Code
        String uniqueCode = "ECO" + (int) Math.round(discountValue) + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Create Coupon
        Coupon coupon = Coupon.builder()
                .code(uniqueCode)
                .user(user)
                .discountType(discountType)
                .discountValue(discountValue)
                .minOrderValue(minOrderValue)
                .pointsRequired(pointsRequired)
                .expiryDate(LocalDate.now().plusDays(30)) // 30 days validity for claimed coupons
                .status("UNUSED")
                .description("Redeemed for " + pointsRequired + " points")
                .unlockThreshold(0) // 0 for manual redemption
                .build();

        couponRepository.save(coupon);

        // Log History
        CarbonPointsHistory history = CarbonPointsHistory.builder()
                .userId(user.getId())
                .pointsChange((long) -pointsRequired)
                .description("Redeemed coupon " + uniqueCode)
                .build();
        carbonPointsHistoryRepository.save(history);

        // Return Coupon AND updated points
        return Map.of("coupon", coupon, "updatedPoints", updatedPoints);
    }

    public List<Coupon> getUserCoupons(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return couponRepository.findByUser(user);
    }

    public Coupon validateCouponForPreview(String code, Long userId, Double cartSubtotal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Use existing repo method or stream
        List<Coupon> userCoupons = couponRepository.findByUser(user);

        Coupon coupon = userCoupons.stream()
                .filter(c -> c.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid coupon code or does not belong to you"));

        if (!"UNUSED".equalsIgnoreCase(coupon.getStatus())) {
            throw new RuntimeException("Coupon is " + coupon.getStatus());
        }
        if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Coupon has expired");
        }
        if (cartSubtotal < coupon.getMinOrderValue()) {
            throw new RuntimeException("Order amount must be at least " + coupon.getMinOrderValue());
        }

        return coupon;
    }
}
