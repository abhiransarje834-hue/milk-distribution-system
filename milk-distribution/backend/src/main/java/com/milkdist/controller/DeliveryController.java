package com.milkdist.controller;

import com.milkdist.dto.*;
import com.milkdist.entity.User;
import com.milkdist.repository.UserRepository;
import com.milkdist.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final UserRepository userRepository;

    private com.milkdist.entity.User getUser(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow();
    }

    @PostMapping
    public ResponseEntity<DeliveryResponse> saveDelivery(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody DeliveryRequest req) {
        com.milkdist.entity.User user = getUser(ud);
        return ResponseEntity.ok(deliveryService.saveDelivery(user.getId(), user.getRole(), req));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<DeliveryResponse>> getDeliveriesForDate(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        com.milkdist.entity.User user = getUser(ud);
        return ResponseEntity.ok(deliveryService.getDeliveriesForDate(user.getId(), user.getRole(), date));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<DeliveryResponse>> getCustomerDeliveries(
            @PathVariable Long customerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(deliveryService.getCustomerDeliveries(customerId, start, end));
    }

    @GetMapping("/my-customers")
    public ResponseEntity<List<CustomerResponse>> getAssignedCustomers(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(deliveryService.getAssignedCustomers(getUser(ud).getId()));
    }

    @PostMapping("/my-customers")
    public ResponseEntity<CustomerResponse> addCustomer(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.ok(deliveryService.addCustomerByDeliveryBoy(getUser(ud).getId(), req));
    }
}
