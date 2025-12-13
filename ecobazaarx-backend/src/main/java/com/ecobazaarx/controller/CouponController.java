package com.ecobazaarx.controller;

import com.ecobazaarx.entity.Coupon;
import com.ecobazaarx.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Coupon>> getUserCoupons(@PathVariable Long userId) {
        return ResponseEntity.ok(couponService.getUserCoupons(userId));
    }

    @PostMapping("/claim")
    public ResponseEntity<Map<String, Object>> claimCoupon(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());

        Integer pointsRequired = payload.containsKey("pointsRequired")
                ? Integer.parseInt(payload.get("pointsRequired").toString())
                : 500;
        Double discountValue = payload.containsKey("discountValue")
                ? Double.parseDouble(payload.get("discountValue").toString())
                : 10.0;
        Double minOrderValue = payload.containsKey("minOrderValue")
                ? Double.parseDouble(payload.get("minOrderValue").toString())
                : 200.0;
        String discountType = "PERCENT";

        try {
            // Now returns Map with "coupon" and "updatedPoints"
            Map<String, Object> result = couponService.claimCoupon(userId, discountType, discountValue, pointsRequired,
                    minOrderValue);

            Map<String, Object> response = new HashMap<>(result);
            response.put("success", true);
            response.put("message", "Coupon claimed successfully!");

            return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            // Conflict (Duplicate claim)
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            // Bad Request (Insufficient points)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyCoupon(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String code = (String) payload.get("couponCode");
        Double subtotal = Double.valueOf(payload.get("subtotal").toString());

        try {
            Coupon coupon = couponService.validateCouponForPreview(code, userId, subtotal);

            double discountAmount = 0;
            if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
                discountAmount = (subtotal * coupon.getDiscountValue()) / 100.0;
            } else {
                discountAmount = coupon.getDiscountValue();
            }

            // Cap discount at subtotal
            if (discountAmount > subtotal)
                discountAmount = subtotal;

            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("discountAmount", discountAmount);
            response.put("newTotal", subtotal - discountAmount);
            response.put("couponCode", coupon.getCode());
            response.put("discountValue", coupon.getDiscountValue());
            response.put("message", "Coupon applied: " + coupon.getDiscountValue() + "% OFF");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", e.getMessage()));
        }
    }
}
