package com.ecobazaarx.repository;

import com.ecobazaarx.entity.Coupon;
import com.ecobazaarx.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByUser(User user);
    Optional<Coupon> findByCode(String code);
    
    // To check if user already received reward for X points
    boolean existsByUserAndUnlockThreshold(User user, Integer unlockThreshold);
}
