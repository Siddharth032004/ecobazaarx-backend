package com.ecobazaarx.controller;

import com.ecobazaarx.dto.LeaderboardEntryDto;
import com.ecobazaarx.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "month") String period) {
        // period is currently unused, defaults to month logic in service
        return ResponseEntity.ok(leaderboardService.getTopEcoSaversOfMonth(limit));
    }
}
