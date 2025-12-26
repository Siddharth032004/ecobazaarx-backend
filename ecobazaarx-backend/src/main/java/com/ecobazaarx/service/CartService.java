package com.ecobazaarx.service;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ecobazaarx.entity.Cart;
import com.ecobazaarx.entity.CartItem;
import com.ecobazaarx.entity.Order;
import com.ecobazaarx.entity.OrderItem;
import com.ecobazaarx.entity.Product;
import com.ecobazaarx.repository.CartRepository;
import com.ecobazaarx.repository.OrderRepository;
import com.ecobazaarx.repository.ProductRepository;
import com.ecobazaarx.dto.CartDto;
import com.ecobazaarx.dto.CartItemDto;
import com.ecobazaarx.util.MapperUtil;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {
  private final CartRepository cartRepository;
  private final ProductRepository productRepository;
  private final OrderRepository orderRepository;
  private final RewardsService rewardsService; // Inject RewardsService
  private final com.ecobazaarx.repository.UserRepository userRepository; // Inject UserRepository to pass User to
                                                                         // rewards

  public Cart getOrCreateCartForUser(Long userId) {
    return cartRepository.findByUserId(userId)
        .orElseGet(() -> {
          Cart c = new Cart();
          c.setUserId(userId);
          return cartRepository.save(c);
        });
  }

  public CartDto getCartDto(Long userId) {
    Cart cart = getOrCreateCartForUser(userId);
    CartDto dto = MapperUtil.toCartDto(cart);
    if (dto != null && dto.getItems() != null) {
      java.util.List<Long> productIds = dto.getItems().stream()
          .map(CartItemDto::getProductId)
          .collect(java.util.stream.Collectors.toList());

      java.util.Map<Long, Product> productMap = productRepository.findAllById(productIds).stream()
          .collect(java.util.stream.Collectors.toMap(Product::getId, p -> p));

      for (CartItemDto itemDto : dto.getItems()) {
        Product p = productMap.get(itemDto.getProductId());
        if (p != null) {
          itemDto.setAvailableStock(p.getStockQuantity());
          itemDto.setProductCity(p.getCity());
          itemDto.setProductState(p.getState());
          itemDto.setImageUrl(p.getImageUrl());
        }
      }
    }
    return dto;
  }

  @Transactional
  public Cart addToCart(Long userId, Long productId, int qty) {
    Product p = productRepository.findById(productId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    if (p.getStockQuantity() < qty) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough stock");
    }
    Cart cart = getOrCreateCartForUser(userId);
    Optional<CartItem> existing = cart.getItems().stream()
        .filter(i -> i.getProductId().equals(productId))
        .findFirst();

    if (existing.isPresent()) {
      CartItem it = existing.get();
      it.setQuantity(it.getQuantity() + qty);
    } else {
      CartItem it = new CartItem();
      it.setCart(cart);
      it.setProductId(productId);
      it.setProductName(p.getName());
      it.setProductPrice(p.getPrice());
      it.setQuantity(qty);
      it.setCarbonFootprintPerUnit(p.getCarbonFootprintPerUnit());
      // carbonSavedPerItem is calculated in ProductService.create/update, so it
      // should be available.
      // Fallback to 0 if null.
      it.setCarbonSavedPerItem(p.getCarbonSavedPerItem() != null ? p.getCarbonSavedPerItem() : 0.0);
      it.setImageUrl(p.getImageUrl());
      cart.getItems().add(it);
    }
    return cartRepository.save(cart);
  }

  @Transactional
  public CartDto updateItemQuantity(Long userId, Long itemId, int quantity) {
    Cart cart = getOrCreateCartForUser(userId);
    CartItem item = cart.getItems().stream()
        .filter(i -> i.getId().equals(itemId))
        .findFirst()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));

    Product p = productRepository.findById(item.getProductId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

    if (p.getStockQuantity() < quantity) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough stock. Available: " + p.getStockQuantity());
    }

    item.setQuantity(quantity);
    cartRepository.save(cart);
    return getCartDto(userId);
  }

  @Transactional
  public CartDto removeItem(Long userId, Long itemId) {
    Cart cart = getOrCreateCartForUser(userId);
    boolean removed = cart.getItems().removeIf(i -> i.getId().equals(itemId));
    if (!removed) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found in cart");
    }
    cartRepository.save(cart);
    return getCartDto(userId);
  }

  @Transactional
  public Order checkout(Long userId, com.ecobazaarx.entity.Address shippingAddress, String couponCode) {
    Cart cart = getOrCreateCartForUser(userId);

    if (cart.getItems().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
    }

    // --- 1. Calculate Totals & Validate Initial Stock ---
    // --- 1. Calculate Totals & Validate Initial Stock ---
    double subtotal = 0.0;
    double totalCarbonSaved = 0.0;
    double totalShippingCost = 0.0;

    // We snapshot items to avoid ConcurrentModificationException if we were
    // modifying cart in place
    // though here we just read.
    java.util.List<CartItem> cartItems = new ArrayList<>(cart.getItems());

    for (CartItem it : cartItems) {
      // Basic check, real atomic check happens at decrement
      Product p = productRepository.findById(it.getProductId())
          .orElseThrow(
              () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + it.getProductName()));

      if (p.getStockQuantity() < it.getQuantity()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough stock for " + p.getName());
      }

      subtotal += it.getProductPrice() * it.getQuantity();

      double savedPerItem = it.getCarbonSavedPerItem() != null ? it.getCarbonSavedPerItem()
          : (p.getCarbonSavedPerItem() != null ? p.getCarbonSavedPerItem() : 0.0);

      // Apply Transport Emission specific to this item's source
      double transportEmission = calculateTransportEmission(p.getCity(), p.getState(), shippingAddress.getCity(),
          shippingAddress.getState());
      double finalSavedPerItem = Math.max(0, savedPerItem - transportEmission);

      totalCarbonSaved += finalSavedPerItem * it.getQuantity();

      // Calculate Shipping Fee (Per Product Line Item) matches Frontend
      totalShippingCost += calculateShippingFee(p.getCity(), p.getState(), shippingAddress.getCity(),
          shippingAddress.getState());
    }

    // Include Shipping Cost (Dynamic)
    double totalAmount = subtotal + totalShippingCost;

    com.ecobazaarx.entity.User user = userRepository.findById(userId).orElseThrow();

    // --- 2. Apply Coupon ---
    Double discountAmount = 0.0;
    String appliedCouponCode = null;
    com.ecobazaarx.entity.Coupon couponToUse = null;

    if (couponCode != null && !couponCode.trim().isEmpty()) {
      try {
        couponToUse = rewardsService.validateCoupon(couponCode, user, totalAmount);
        if ("PERCENT".equals(couponToUse.getDiscountType())) {
          discountAmount = (totalAmount * couponToUse.getDiscountValue()) / 100.0;
        } else {
          discountAmount = couponToUse.getDiscountValue();
        }
        if (discountAmount > totalAmount)
          discountAmount = totalAmount;

        appliedCouponCode = couponToUse.getCode();
      } catch (RuntimeException e) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Coupon: " + e.getMessage());
      }
    }

    double finalTotalAmount = totalAmount - discountAmount;

    // --- 3. Create Order ---
    Order order = Order.builder()
        .userId(userId)
        .totalAmount(finalTotalAmount)
        .totalCarbonSaved(totalCarbonSaved)
        .status("CONFIRMED")
        .shippingAddress(shippingAddress)
        .couponCode(appliedCouponCode)
        .discountAmount(discountAmount)
        .build();

    // --- 4. Process Items & Atomic Stock Decrement ---
    for (CartItem cartItem : cartItems) {
      // Atomic Decrement: returns count of updated rows. 0 means failed condition
      // (stock < qty).
      int updatedRows = productRepository.decreaseStock(cartItem.getProductId(), cartItem.getQuantity());
      if (updatedRows == 0) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Stock unavailable for product: " + cartItem.getProductName() + " during checkout execution.");
      }

      // Re-fetch product only to get details for OrderItem history (optional if
      // CartItem has enough info)
      // We rely on CartItem snapshot for price stability during this transaction
      Product p = productRepository.findById(cartItem.getProductId()).orElseThrow(); // Cached in 1st level cache likely

      // --- Transport Emission Logic ---
      double transportEmission = calculateTransportEmission(p.getCity(), p.getState(), shippingAddress.getCity(),
          shippingAddress.getState());

      double baseSavedPerItem = cartItem.getCarbonSavedPerItem() != null ? cartItem.getCarbonSavedPerItem() : 0.0;
      double finalSavedPerItem = Math.max(0, baseSavedPerItem - transportEmission);

      OrderItem orderItem = OrderItem.builder()
          .order(order)
          .productId(cartItem.getProductId())
          .productName(cartItem.getProductName())
          .price(cartItem.getProductPrice())
          .quantity(cartItem.getQuantity())
          .carbonFootprintPerUnit(cartItem.getCarbonFootprintPerUnit())
          .carbonSavedPerItem(finalSavedPerItem)
          .sellerId((p.getSeller() != null && p.getSeller().getId() != null) ? p.getSeller().getId() : 1L) // Fallback
                                                                                                           // to Admin
                                                                                                           // (ID 1)
          .build();

      order.getItems().add(orderItem);
    }

    // --- 5. Finalize Order & Coupon ---
    Order savedOrder = orderRepository.save(order);

    if (couponToUse != null) {
      rewardsService.markCouponUsed(couponToUse);
    }

    // --- 6. Process Rewards ---
    rewardsService.processOrderRewards(savedOrder, user);

    // --- 7. Clear Cart ---
    cart.getItems().clear();
    cartRepository.save(cart);

    return savedOrder;
  }

  private double calculateTransportEmission(String sellerCity, String sellerState, String buyerCity,
      String buyerState) {
    if (sellerCity == null || sellerState == null || buyerCity == null || buyerState == null) {
      // If data is missing, we assume worst case (diff state) or 0?
      // Prompt says "Complete the missing CO2 calculation logic using the existing
      // Checkout address fields."
      // Let's assume 1.2 (Worst Case) if unknown to encourage data entry, or 0 if we
      // want to be lenient?
      // Logic requirement: "Compare Seller city/state... Buyer city/state".
      // If we don't have it, we can't calculate correct savings.
      // Let's default to standard logic:
      return 1.2;
    }

    String sCity = sellerCity.trim().toLowerCase();
    String sState = sellerState.trim().toLowerCase();
    String bCity = buyerCity.trim().toLowerCase();
    String bState = buyerState.trim().toLowerCase();

    if (sState.equals(bState)) {
      if (sCity.equals(bCity)) {
        return 0.2; // Same City
      }
      return 0.6; // Same State, Diff City
    }
    return 1.2; // Diff State
  }

  private double calculateShippingFee(String sellerCity, String sellerState, String buyerCity, String buyerState) {
    if (sellerCity == null || sellerState == null || buyerCity == null || buyerState == null) {
      // Default to max fee if location unknown
      return 80.0;
    }

    String sCity = sellerCity.trim().toLowerCase();
    String sState = sellerState.trim().toLowerCase();
    String bCity = buyerCity.trim().toLowerCase();
    String bState = buyerState.trim().toLowerCase();

    if (sState.equals(bState)) {
      if (sCity.equals(bCity)) {
        return 20.0; // Same City / District
      }
      return 50.0; // Same State, different City
    }
    return 80.0; // Different State
  }
}
