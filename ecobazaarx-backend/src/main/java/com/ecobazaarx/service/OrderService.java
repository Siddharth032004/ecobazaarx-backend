package com.ecobazaarx.service;

import com.ecobazaarx.dto.OrderDto;
import com.ecobazaarx.dto.OrderItemDto;
import com.ecobazaarx.entity.Order;
import com.ecobazaarx.entity.OrderItem;
import com.ecobazaarx.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final RewardsService rewardsService; // Inject RewardsService

    public List<OrderDto> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findAllByUserId(userId);
        return orders.stream()
                .map(this::toOrderDto)
                .collect(Collectors.toList());
    }

    public org.springframework.data.domain.Page<OrderDto> getUserOrdersPaginated(Long userId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("timestamp").descending());
        org.springframework.data.domain.Page<Order> orderPage = orderRepository.findByUserId(userId, pageable);
        return orderPage.map(this::toOrderDto);
    }

    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toOrderDto(order);
    }

    OrderDto toOrderDto(Order order) {
        List<OrderItemDto> items = order.getItems().stream()
                .map(this::toOrderItemDto)
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount())
                .totalCarbonSaved(order.getTotalCarbonSaved())
                .status(order.getStatus())
                .timestamp(order.getTimestamp())
                .items(items)
                .carbonPointsEarned(order.getCarbonPointsEarned()) // Map points
                .build();
    }

    private OrderItemDto toOrderItemDto(OrderItem item) {
        return OrderItemDto.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .carbonFootprintPerUnit(item.getCarbonFootprintPerUnit())
                .carbonSavedPerItem(item.getCarbonSavedPerItem())
                .sellerId(item.getSellerId())
                .build();
    }
}
