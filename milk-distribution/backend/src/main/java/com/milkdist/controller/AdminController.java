package com.milkdist.controller;

import com.milkdist.dto.*;
import com.milkdist.entity.Distributor;
import com.milkdist.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/distributors")
    public ResponseEntity<DistributorResponse> addDistributor(@Valid @RequestBody DistributorRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addDistributor(req));
    }

    @GetMapping("/distributors")
    public ResponseEntity<Page<DistributorResponse>> getAllDistributors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getAllDistributors(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/distributors/{id}")
    public ResponseEntity<DistributorResponse> getDistributor(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getDistributor(id));
    }

    @PatchMapping("/distributors/{id}/status")
    public ResponseEntity<DistributorResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateStatus(id, Distributor.Status.valueOf(body.get("status"))));
    }

    @PatchMapping("/distributors/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        adminService.resetPassword(id, body.get("password"));
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}
