package com.ecobazaarx.service;

import com.ecobazaarx.dto.LeaderboardEntryDto;
import com.ecobazaarx.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final OrderRepository orderRepository;

    public List<LeaderboardEntryDto> getTopEcoSaversOfMonth(int limit) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
        LocalDateTime endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);

        return orderRepository.findTopEcoSavers(startOfMonth, endOfMonth, PageRequest.of(0, limit));
    }
}
