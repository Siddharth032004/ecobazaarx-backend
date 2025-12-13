package com.ecobazaarx.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
  Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

  java.util.Optional<Product> findBySlug(String slug);

  Page<Product> findByPriceBetween(Double min, Double max, Pageable p);

  Page<Product> findByCategoryNameIgnoreCase(String category, Pageable p);

  List<Product> findBySeller(User seller);

  Page<Product> findByIsFeaturedTrue(Pageable pageable);

  @org.springframework.data.jpa.repository.Modifying
  @org.springframework.data.jpa.repository.Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.id = :id AND p.stockQuantity >= :quantity")
  int decreaseStock(@org.springframework.data.repository.query.Param("id") Long id,
      @org.springframework.data.repository.query.Param("quantity") int quantity);
}
