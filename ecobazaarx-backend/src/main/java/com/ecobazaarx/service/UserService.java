package com.ecobazaarx.service;

import com.ecobazaarx.dto.RegisterRequest;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 🔹 PASTE THE METHODS HERE
    public void register(RegisterRequest req) {
        // Check if email already exists
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }

        // Validate and set role
        String role = req.getRole();
        if (role == null || role.isBlank()) {
            role = "CUSTOMER"; // Default to CUSTOMER if not specified
        } else {
            role = role.toUpperCase().trim();
            // Prevent ADMIN role registration - only CUSTOMER and SELLER allowed
            if (role.equals("ADMIN")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "ADMIN role cannot be assigned during registration");
            }
            if (!role.equals("CUSTOMER") && !role.equals("SELLER")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role. Must be CUSTOMER or SELLER");
            }
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        user.setTotalCarbonPoints(0.0);
        user.setAvailableCarbonPoints(0.0);
        user.setTotalEcoOrders(0);
        user.setCurrentLevel("Eco Newbie");
        userRepository.save(user);
    }

    public User validateLogin(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }
}
