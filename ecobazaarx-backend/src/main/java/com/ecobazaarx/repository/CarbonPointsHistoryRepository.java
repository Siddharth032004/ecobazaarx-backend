package com.ecobazaarx.repository;

import com.ecobazaarx.entity.CarbonPointsHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarbonPointsHistoryRepository extends JpaRepository<CarbonPointsHistory, Long> {
    List<CarbonPointsHistory> findByUserIdOrderByTimestampDesc(Long userId);
}
