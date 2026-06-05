package com.milkdist.controller;

import com.milkdist.dto.*;
import com.milkdist.repository.UserRepository;
import com.milkdist.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/generate")
    public ResponseEntity<List<BillResponse>> generateBills(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(billingService.generateMonthlyBills(getUserId(ud), month, year));
    }

    @GetMapping
    public ResponseEntity<List<BillResponse>> getBills(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(billingService.getBillsByMonth(getUserId(ud), month, year));
    }

    @PostMapping("/payment")
    public ResponseEntity<BillResponse> recordPayment(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(billingService.recordPayment(getUserId(ud), req));
    }
}
