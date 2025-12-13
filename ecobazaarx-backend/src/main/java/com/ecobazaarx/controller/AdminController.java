package com.ecobazaarx.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecobazaarx.dto.CreateUserRequest;
import com.ecobazaarx.dto.UserDto;
import com.ecobazaarx.service.AdminService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

  private final AdminService adminService;

  @GetMapping("/insights")
  public Map<String, Object> insights() {
    return adminService.siteInsights();
  }

  @GetMapping("/analytics")
  public ResponseEntity<List<Map<String, Object>>> getAnalytics() {
    return ResponseEntity.ok(adminService.getAnalytics());
  }

  @PostMapping("/create-user")
  public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest req) {
    UserDto user = adminService.createUser(req);
    return ResponseEntity.ok(user);
  }

  @GetMapping("/users")
  public ResponseEntity<List<UserDto>> getAllUsers() {
    List<UserDto> users = adminService.getAllUsers();
    return ResponseEntity.ok(users);
  }

  @DeleteMapping("/users/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    adminService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/users/{id}/role")
  public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestBody UpdateRoleRequest req) {
    UserDto user = adminService.updateUserRole(id, req.getRole());
    return ResponseEntity.ok(user);
  }

  @PutMapping("/users/{id}/status")
  public ResponseEntity<UserDto> updateUserStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest req) {
    UserDto user = adminService.updateUserStatus(id, req.isEnabled());
    return ResponseEntity.ok(user);
  }

  @DeleteMapping("/system-reset")
  public ResponseEntity<Void> resetSystemData() {
    adminService.resetSystemData();
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/fix-schema")
  public ResponseEntity<String> fixDatabaseSchema() {
    String result = adminService.fixDatabaseSchema();
    return ResponseEntity.ok(result);
  }

  @Data
  public static class UpdateRoleRequest {
    private String role;
  }

  @Data
  public static class UpdateStatusRequest {
    private boolean enabled;
  }
}