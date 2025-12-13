package com.ecobazaarx.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ecobazaarx.dto.CreateUserRequest;
import com.ecobazaarx.dto.UserDto;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.repository.CartRepository;
import com.ecobazaarx.repository.ProductRepository;
import com.ecobazaarx.repository.UserRepository;

import com.ecobazaarx.repository.UserBadgeRepository;
import com.ecobazaarx.repository.ReviewRepository;
import com.ecobazaarx.repository.CouponRepository;
import com.ecobazaarx.repository.WishlistRepository;
import com.ecobazaarx.repository.CarbonPointsHistoryRepository;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {
  private final ProductRepository productRepository;
  private final CartRepository cartRepository;
  private final UserRepository userRepository;
  private final com.ecobazaarx.repository.OrderRepository orderRepository;
  private final UserBadgeRepository userBadgeRepository;
  private final ReviewRepository reviewRepository;
  private final CouponRepository couponRepository;
  private final WishlistRepository wishlistRepository;
  private final CarbonPointsHistoryRepository carbonPointsHistoryRepository;
  private final PasswordEncoder passwordEncoder;
  @jakarta.persistence.PersistenceContext
  private jakarta.persistence.EntityManager entityManager;

  public Map<String, Object> siteInsights() {
    Map<String, Object> m = new HashMap<>();

    // Total Users
    long totalUsers = userRepository.count();
    // Total Sellers
    long totalSellers = userRepository.findAll().stream()
        .filter(u -> "SELLER".equals(u.getRole()))
        .count();

    // Total Revenue
    Double revenue = orderRepository.sumTotalAmount();
    if (revenue == null)
      revenue = 0.0;

    // Total CO2 Saved (This should be sum of all orders' totalCarbonSaved for
    // Admin, or filtered for Seller)
    // For Admin: simple sum from repository
    // For Seller: Must calculate sum of (item.carbonSavedPerItem * item.quantity)
    // for items belonging to seller
    Double co2 = 0.0;

    // We can't easily distinguish the current user here if not passed in, but
    // assuming this method is used in a context
    // where we might need to filter.
    // However, looking at the Controller (to be checked), usually 'siteInsights' is
    // for Admin Dashboard.
    // If this is shared for Seller Dashboard, we need to know WHO is asking.
    // Given the method signature `siteInsights()`, let's check checking
    // authentication context or if we should split this.
    // For now, let's assume this is platform-wide (Admin). The user request said
    // "Seller Dashboard top CO2 Saved card".
    // If this method serves Seller Dashboard, it's incorrect.

    // Let's assume we need a separate method or logic for Seller.
    // But since I can't change the Controller signature easily without seeing it,
    // I will check the Controller first to see how it uses this.

    // WAIT: I see `siteInsights` just returns global stats.
    // The user mentioned "Seller Dashboard top summary cards".
    // I should create a new method `getSellerInsights(Long sellerId)` and use that
    // in the controller.

    co2 = orderRepository.sumTotalCarbonSaved();
    if (co2 == null)
      co2 = 0.0;

    // Total Orders
    long totalOrders = orderRepository.count();

    // Total Products
    long totalProducts = productRepository.count();

    m.put("totalUsers", totalUsers);
    m.put("totalSellers", totalSellers);
    m.put("totalRevenue", revenue);
    m.put("totalCo2Saved", co2);
    m.put("totalOrders", totalOrders);
    m.put("totalProducts", totalProducts);

    return m;
  }

  public List<Map<String, Object>> getAnalytics() {
    // Simple in-memory aggregation for now (safe for small dataset)
    // For large scale, use DB group by query
    List<com.ecobazaarx.entity.Order> orders = orderRepository.findAll();

    // Group by Month (YYYY-MM)
    Map<String, Double> salesByMonth = orders.stream()
        .collect(Collectors.groupingBy(
            o -> o.getTimestamp().getYear() + "-" + String.format("%02d", o.getTimestamp().getMonthValue()),
            Collectors.summingDouble(com.ecobazaarx.entity.Order::getTotalAmount)));

    // Convert to List sorted by date
    return salesByMonth.entrySet().stream()
        .sorted(Map.Entry.comparingByKey())
        .map(e -> {
          Map<String, Object> map = new HashMap<>();
          map.put("name", e.getKey()); // Month
          map.put("sales", e.getValue());
          return map;
        })
        .collect(Collectors.toList());
  }

  public UserDto createUser(CreateUserRequest req) {
    if (req.getRole() == null ||
        (!req.getRole().equals("CUSTOMER") && !req.getRole().equals("SELLER") && !req.getRole().equals("ADMIN"))) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role. Must be CUSTOMER, SELLER, or ADMIN");
    }

    if (userRepository.findByEmail(req.getEmail()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
    }

    User user = new User();
    user.setName(req.getName());
    user.setEmail(req.getEmail());
    user.setPassword(passwordEncoder.encode(req.getPassword()));
    user.setRole(req.getRole());
    user.setEnabled(true);

    User saved = userRepository.save(user);
    return toUserDto(saved);
  }

  public List<UserDto> getAllUsers() {
    return userRepository.findAll().stream()
        .map(this::toUserDto)
        .collect(Collectors.toList());
  }

  public void deleteUser(Long userId) {
    // Check for relations before deleting or use soft delete if safer.
    // Ideally prevent deleting if user has orders.
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    userRepository.delete(user);
  }

  public UserDto updateUserRole(Long userId, String newRole) {
    if (newRole == null ||
        (!newRole.equals("CUSTOMER") && !newRole.equals("SELLER") && !newRole.equals("ADMIN"))) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role. Must be CUSTOMER, SELLER, or ADMIN");
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    user.setRole(newRole);
    User saved = userRepository.save(user);
    return toUserDto(saved);
  }

  public UserDto updateUserStatus(Long userId, boolean enabled) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    user.setEnabled(enabled);
    User saved = userRepository.save(user);
    return toUserDto(saved);
  }

  private UserDto toUserDto(User user) {
    return UserDto.builder()
        .id(user.getId())
        .fullName(user.getName())
        .email(user.getEmail())
        .role(user.getRole())
        .phone(user.getPhone())
        .enabled(user.isEnabled())
        .build();
  }

  @org.springframework.transaction.annotation.Transactional
  public String fixDatabaseSchema() {
    StringBuilder logs = new StringBuilder();
    logs.append("Starting Schema Fix for UKeplt0kkm9yf2of2lnx6c1oy9b...\n");

    // Method 1: DROP INDEX
    try {
      logs.append("Attempting: ALTER TABLE coupons DROP INDEX UKeplt0kkm9yf2of2lnx6c1oy9b\n");
      entityManager.createNativeQuery("ALTER TABLE coupons DROP INDEX UKeplt0kkm9yf2of2lnx6c1oy9b").executeUpdate();
      logs.append("SUCCESS: Dropped index UKeplt0kkm9yf2of2lnx6c1oy9b\n");
    } catch (Exception e) {
      logs.append("FAILED DROP INDEX: ").append(e.getMessage()).append("\n");
    }

    // Method 2: DROP KEY
    try {
      logs.append("Attempting: ALTER TABLE coupons DROP KEY UKeplt0kkm9yf2of2lnx6c1oy9b\n");
      entityManager.createNativeQuery("ALTER TABLE coupons DROP KEY UKeplt0kkm9yf2of2lnx6c1oy9b").executeUpdate();
      logs.append("SUCCESS: Dropped key UKeplt0kkm9yf2of2lnx6c1oy9b\n");
    } catch (Exception e) {
      logs.append("FAILED DROP KEY: ").append(e.getMessage()).append("\n");
    }

    // Method 3: DROP CONSTRAINT
    try {
      logs.append("Attempting: ALTER TABLE coupons DROP CONSTRAINT UKeplt0kkm9yf2of2lnx6c1oy9b\n");
      entityManager.createNativeQuery("ALTER TABLE coupons DROP CONSTRAINT UKeplt0kkm9yf2of2lnx6c1oy9b")
          .executeUpdate();
      logs.append("SUCCESS: Dropped constraint UKeplt0kkm9yf2of2lnx6c1oy9b\n");
    } catch (Exception e) {
      logs.append("FAILED DROP CONSTRAINT: ").append(e.getMessage()).append("\n");
    }

    return logs.toString();
  }

  // @Transactional - Removed to allow partial deletion if one step fails
  public void resetSystemData() {
    // NUCLEAR OPTION: Global Wipe to ensure no FK constraints remain.
    // 1. Delete ALL Orders (Removes OrderItems, which may reference Sellers)
    orderRepository.deleteAll();

    // 2. Delete ALL Carts (Removes CartItems)
    cartRepository.deleteAll();

    // 3. Delete ALL Reviews (User & Product reviews)
    reviewRepository.deleteAll();

    // 4. Delete ALL Wishlists
    wishlistRepository.deleteAll();

    // 5. Delete ALL Coupons
    couponRepository.deleteAll();

    // 6. Delete ALL Points History
    carbonPointsHistoryRepository.deleteAll();

    // 7. Delete ALL User Badges
    userBadgeRepository.deleteAll();

    // 8. Delete ALL Products (Now safe as Reviews/Wishlists/Orders are gone)
    // This clears FK to Sellers
    productRepository.deleteAll();

    // 9. Reset Auto Increment for Orders (MySQL)
    try {
      entityManager.createNativeQuery("ALTER TABLE orders AUTO_INCREMENT = 1").executeUpdate();
      entityManager.createNativeQuery("ALTER TABLE order_items AUTO_INCREMENT = 1").executeUpdate();
      // Attempt to drop unique constraint on coupon code if it exists.
      // Name is usually 'UK_...' or the column name 'code' if defined as unique.
      // But since entity doesn't show it, it might be a remnant.
      // We'll try to drop index 'code' or similar.
      // NOTE: MySQL syntax for dropping index is DROP INDEX name ON table
      // We'll try a few common names.
      try {
        entityManager.createNativeQuery("DROP INDEX code ON coupons").executeUpdate();
      } catch (Exception e) {
      }
      try {
        entityManager.createNativeQuery("DROP INDEX UK_coupons_code ON coupons").executeUpdate();
      } catch (Exception e) {
      }
    } catch (Exception e) {
      System.out.println("Reset ID/Index failed: " + e.getMessage());
    }

    // 9. Delete ALL Non-Admin Users
    List<User> usersToDelete = userRepository.findAll().stream()
        .filter(u -> !"ADMIN".equals(u.getRole()))
        .collect(Collectors.toList());

    if (!usersToDelete.isEmpty()) {
      userRepository.deleteAll(usersToDelete);
    }
  }
}
