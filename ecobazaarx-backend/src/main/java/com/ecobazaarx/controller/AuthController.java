package com.ecobazaarx.controller;

import com.ecobazaarx.config.JwtConfig;
import com.ecobazaarx.dto.LoginRequest;
import com.ecobazaarx.dto.RegisterRequest;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtConfig jwtConfig;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest req) {
        userService.register(req);
        return ResponseEntity.ok("Registration successful!");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest req) {
        User user = userService.validateLogin(req.getEmail(), req.getPassword());
        String token = jwtConfig.generateToken(user.getId().toString(), user.getRole());
        return ResponseEntity.ok(token);
    }
}
