package com.milkdist.controller;

import com.milkdist.dto.*;
import com.milkdist.entity.MilkPrice;
import com.milkdist.repository.UserRepository;
import com.milkdist.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/distributor")
@RequiredArgsConstructor
public class DistributorController {

    private final DistributorService distributorService;
    private final ReportService reportService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow().getId();
    }

    // Delivery Boys
    @PostMapping("/delivery-boys")
    public ResponseEntity<DeliveryBoyResponse> addDeliveryBoy(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody DeliveryBoyRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(distributorService.addDeliveryBoy(getUserId(ud), req));
    }

    @GetMapping("/delivery-boys")
    public ResponseEntity<List<DeliveryBoyResponse>> getDeliveryBoys(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(distributorService.getDeliveryBoys(getUserId(ud)));
    }

    @PutMapping("/delivery-boys/{id}")
    public ResponseEntity<DeliveryBoyResponse> updateDeliveryBoy(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @Valid @RequestBody DeliveryBoyRequest req) {
        return ResponseEntity.ok(distributorService.updateDeliveryBoy(getUserId(ud), id, req));
    }

    @DeleteMapping("/delivery-boys/{id}")
    public ResponseEntity<Void> deleteDeliveryBoy(
            @AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        distributorService.deleteDeliveryBoy(getUserId(ud), id);
        return ResponseEntity.noContent().build();
    }

    // Customers
    @PostMapping("/customers")
    public ResponseEntity<CustomerResponse> addCustomer(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(distributorService.addCustomer(getUserId(ud), req));
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<CustomerResponse>> getCustomers(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(distributorService.getCustomers(getUserId(ud), search,
            PageRequest.of(page, size, Sort.by("name"))));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<CustomerResponse> getCustomer(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {
        return ResponseEntity.ok(distributorService.getCustomerById(getUserId(ud), id));
    }

    @GetMapping("/customers/{id}/history")
    public ResponseEntity<?> getCustomerHistory(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(distributorService.getCustomerHistory(getUserId(ud), id, month, year));
    }
    @PutMapping("/customers/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.ok(distributorService.updateCustomer(getUserId(ud), id, req));
    }

    // Milk Prices
    @PostMapping("/milk-prices")
    public ResponseEntity<Map<String, String>> updateMilkPrice(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody MilkPriceRequest req) {
        distributorService.updateMilkPrice(getUserId(ud), req);
        return ResponseEntity.ok(Map.of("message", "Price updated"));
    }

    @GetMapping("/milk-prices")
    public ResponseEntity<List<MilkPrice>> getMilkPrices(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(distributorService.getMilkPrices(getUserId(ud)));
    }

    // Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(reportService.getDashboardStats(getUserId(ud)));
    }

    // Reports
    @GetMapping("/reports/daily-chart")
    public ResponseEntity<?> getDailyChart(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(reportService.getDailySalesChart(getUserId(ud), month, year));
    }

    @GetMapping("/reports/monthly-trend")
    public ResponseEntity<?> getMonthlyTrend(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam int year) {
        return ResponseEntity.ok(reportService.getMonthlyTrend(getUserId(ud), year));
    }

    @GetMapping("/reports/delivery-boy-performance")
    public ResponseEntity<?> getDeliveryBoyPerformance(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(reportService.getDeliveryBoyPerformance(getUserId(ud), month, year));
    }
}
