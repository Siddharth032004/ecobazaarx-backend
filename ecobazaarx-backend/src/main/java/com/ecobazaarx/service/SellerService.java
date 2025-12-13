package com.ecobazaarx.service;

import com.ecobazaarx.dto.OrderItemDto;
import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.entity.OrderItem;
import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.repository.OrderItemRepository;
import com.ecobazaarx.repository.ProductRepository;
import com.ecobazaarx.repository.UserRepository;
import com.ecobazaarx.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerService {
        private final ProductRepository productRepository;
        private final OrderItemRepository orderItemRepository;
        private final UserRepository userRepository;

        public com.ecobazaarx.dto.SellerDashboardDto getSellerStats(Long sellerId) {
                User seller = userRepository.findById(sellerId)
                                .orElseThrow(() -> new RuntimeException("Seller not found"));

                List<Product> products = productRepository.findBySeller(seller);
                List<OrderItem> soldItems = orderItemRepository.findBySellerId(sellerId);
                List<com.ecobazaarx.entity.Order> orders = orderItemRepository.findDistinctOrdersBySellerId(sellerId);

                long totalProducts = products.size();
                long totalStock = products.stream()
                                .mapToLong(p -> p.getStockQuantity() == null ? 0 : p.getStockQuantity())
                                .sum();
                long totalOrders = orders.size();
                double totalRevenue = soldItems.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
                double totalCo2Saved = soldItems.stream()
                                .mapToDouble(i -> (i.getCarbonSavedPerItem() != null ? i.getCarbonSavedPerItem() : 0.0)
                                                * i.getQuantity())
                                .sum();

                return com.ecobazaarx.dto.SellerDashboardDto.builder()
                                .totalProducts(totalProducts)
                                .totalStock(totalStock)
                                .totalOrders(totalOrders)
                                .totalRevenue(totalRevenue)
                                .totalCo2Saved(totalCo2Saved)
                                .build();
        }

        public List<com.ecobazaarx.dto.SellerOrderDto> getSellerOrdersList(Long sellerId) {
                List<com.ecobazaarx.entity.Order> orders = orderItemRepository.findDistinctOrdersBySellerId(sellerId);
                List<OrderItem> allSellerItems = orderItemRepository.findBySellerId(sellerId);

                return orders.stream().map(order -> {
                        // Filter items for this order and seller
                        List<OrderItem> orderItems = allSellerItems.stream()
                                        .filter(item -> item.getOrder().getId().equals(order.getId()))
                                        .collect(Collectors.toList());

                        double totalAmount = orderItems.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
                        double totalCo2 = orderItems.stream()
                                        .mapToDouble(i -> (i.getCarbonSavedPerItem() != null ? i.getCarbonSavedPerItem()
                                                        : 0.0)
                                                        * i.getQuantity())
                                        .sum();

                        // Allow access to customer name from order -> user relationship if needed.
                        // For now, we might need to fetch user details if Order stores userId.
                        String customerName = "Customer #" + order.getUserId(); // Placeholder if User entity is not
                                                                                // eager fetch
                        String customerEmail = "";

                        // Try to fetch customer details
                        java.util.Optional<User> customerOpt = userRepository.findById(order.getUserId());
                        if (customerOpt.isPresent()) {
                                customerName = customerOpt.get().getName();
                                customerEmail = customerOpt.get().getEmail();
                        }

                        return com.ecobazaarx.dto.SellerOrderDto.builder()
                                        .orderId(order.getId())
                                        .orderDate(order.getTimestamp())
                                        .status(order.getStatus())
                                        .customerName(customerName)
                                        .customerEmail(customerEmail)
                                        .itemsCount(orderItems.stream().mapToInt(OrderItem::getQuantity).sum())
                                        .totalAmount(totalAmount)
                                        .totalCo2Saved(totalCo2)
                                        .items(orderItems.stream().map(this::toSellerOrderItemDto)
                                                        .collect(Collectors.toList()))
                                        .build();
                }).collect(Collectors.toList());
        }

        public com.ecobazaarx.dto.SellerOrderDto getSellerOrderDetails(Long sellerId, Long orderId) {
                // Re-use logic or fetch specific
                List<com.ecobazaarx.dto.SellerOrderDto> all = getSellerOrdersList(sellerId);
                return all.stream().filter(o -> o.getOrderId().equals(orderId)).findFirst()
                                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));
        }

        private com.ecobazaarx.dto.SellerOrderDto.SellerOrderItemDto toSellerOrderItemDto(OrderItem item) {
                // We need product image. ProductRepository.findById could be expensive in loop?
                // Optimally we carry image url in OrderItem or fetch efficiently.
                // For now, let's just return basic info or query product if needed.
                // Assuming OrderItem doesn't store image url, we might need to fetch product.
                // However, for performance, let's skip image or fetch if critical.
                // Update: OrderItem entity doesn't have image. Product does.
                String imageUrl = "";
                try {
                        Product p = productRepository.findById(item.getProductId()).orElse(null);
                        if (p != null)
                                imageUrl = p.getImageUrl();
                } catch (Exception e) {
                }

                return com.ecobazaarx.dto.SellerOrderDto.SellerOrderItemDto.builder()
                                .productName(item.getProductName())
                                .pricePerUnit(item.getPrice())
                                .quantity(item.getQuantity())
                                .subtotal(item.getPrice() * item.getQuantity())
                                .co2Saved((item.getCarbonSavedPerItem() != null ? item.getCarbonSavedPerItem() : 0.0)
                                                * item.getQuantity())
                                .imageUrl(imageUrl)
                                .build();
        }

        public List<ProductDto> getSellerProducts(Long sellerId) {
                User seller = userRepository.findById(sellerId)
                                .orElseThrow(() -> new RuntimeException("Seller not found"));
                List<Product> products = productRepository.findBySeller(seller);
                return products.stream()
                                .map(MapperUtil::toProductDto)
                                .collect(Collectors.toList());
        }

        // Deprecated/Legacy method if needed, or remove
        public List<OrderItemDto> getSellerOrders(Long sellerId) {
                List<OrderItem> orderItems = orderItemRepository.findBySellerId(sellerId);
                return orderItems.stream()
                                .map(this::toOrderItemDto)
                                .collect(Collectors.toList());
        }

        private OrderItemDto toOrderItemDto(OrderItem item) {
                return OrderItemDto.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .price(item.getPrice())
                                .quantity(item.getQuantity())
                                .carbonFootprintPerUnit(item.getCarbonFootprintPerUnit())
                                .sellerId(item.getSellerId())
                                .build();
        }
}
