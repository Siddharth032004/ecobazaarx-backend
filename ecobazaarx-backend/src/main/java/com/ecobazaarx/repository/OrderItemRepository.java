package com.ecobazaarx.repository;

import com.ecobazaarx.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT oi FROM OrderItem oi WHERE oi.sellerId = :sellerId")
    List<OrderItem> findBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT DISTINCT oi.order FROM OrderItem oi WHERE oi.sellerId = :sellerId ORDER BY oi.order.timestamp DESC")
    List<com.ecobazaarx.entity.Order> findDistinctOrdersBySellerId(@Param("sellerId") Long sellerId);
}
