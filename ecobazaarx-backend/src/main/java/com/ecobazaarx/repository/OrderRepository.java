package com.ecobazaarx.repository;

import com.ecobazaarx.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
        List<Order> findByUserIdOrderByTimestampDesc(Long userId);

        @org.springframework.data.jpa.repository.Query("SELECT DISTINCT o FROM com.ecobazaarx.entity.Order o LEFT JOIN FETCH o.items WHERE o.userId = ?1 ORDER BY o.timestamp DESC")
        List<Order> findAllByUserId(Long userId);

        org.springframework.data.domain.Page<Order> findByUserId(Long userId,
                        org.springframework.data.domain.Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM com.ecobazaarx.entity.Order o")
        Double sumTotalAmount();

        @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalCarbonSaved) FROM com.ecobazaarx.entity.Order o")
        Double sumTotalCarbonSaved();

        @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalCarbonSaved) FROM com.ecobazaarx.entity.Order o WHERE o.userId = :userId")
        Double sumTotalCarbonSavedByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

        @org.springframework.data.jpa.repository.Query("SELECT new com.ecobazaarx.dto.LeaderboardEntryDto(o.userId, u.name, SUM(o.totalCarbonSaved), u.totalCarbonPoints, u.currentLevel, COUNT(o)) "
                        +
                        "FROM com.ecobazaarx.entity.Order o JOIN com.ecobazaarx.entity.User u ON o.userId = u.id " +
                        "WHERE o.timestamp BETWEEN :startDate AND :endDate " +
                        "GROUP BY o.userId, u.name, u.totalCarbonPoints, u.currentLevel " +
                        "ORDER BY SUM(o.totalCarbonSaved) DESC")
        List<com.ecobazaarx.dto.LeaderboardEntryDto> findTopEcoSavers(java.time.LocalDateTime startDate,
                        java.time.LocalDateTime endDate, org.springframework.data.domain.Pageable pageable);
}
