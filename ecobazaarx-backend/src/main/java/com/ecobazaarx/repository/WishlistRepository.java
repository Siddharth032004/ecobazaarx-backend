package com.ecobazaarx.repository;

import com.ecobazaarx.entity.User;
import com.ecobazaarx.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUser(User user);

    Optional<Wishlist> findByUserAndProductId(User user, Long productId);

    List<Wishlist> findByProductId(Long productId);
}
