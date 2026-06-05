package com.milkdist.service;

import com.milkdist.dto.*;
import com.milkdist.entity.*;
import com.milkdist.exception.AppException;
import com.milkdist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DistributorService {

    private final DistributorRepository distributorRepository;
    private final DeliveryBoyRepository deliveryBoyRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final MilkPriceRepository milkPriceRepository;
    private final PasswordEncoder passwordEncoder;
    private final DailyDeliveryRepository dailyDeliveryRepository;
    private final PaymentRepository paymentRepository;

    public Distributor getDistributorByUserId(Long userId) {
        return distributorRepository.findByUserId(userId)
            .orElseThrow(() -> AppException.notFound("Distributor profile not found"));
    }

    // Delivery Boy Management
    @Transactional
    public DeliveryBoyResponse addDeliveryBoy(Long distributorUserId, DeliveryBoyRequest req) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        if (userRepository.existsByUsername(req.getUsername()))
            throw AppException.badRequest("Username already exists");

        User user = userRepository.save(User.builder()
            .username(req.getUsername())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(User.Role.DELIVERY_BOY)
            .active(true)
            .build());

        DeliveryBoy db = deliveryBoyRepository.save(DeliveryBoy.builder()
            .name(req.getName())
            .mobile(req.getMobile())
            .address(req.getAddress())
            .distributor(distributor)
            .user(user)
            .active(true)
            .build());

        return toDeliveryBoyResponse(db);
    }

    public List<DeliveryBoyResponse> getDeliveryBoys(Long distributorUserId) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        return deliveryBoyRepository.findByDistributor(distributor)
            .stream().map(this::toDeliveryBoyResponse).toList();
    }

    @Transactional
    public DeliveryBoyResponse updateDeliveryBoy(Long distributorUserId, Long dbId, DeliveryBoyRequest req) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        DeliveryBoy db = deliveryBoyRepository.findById(dbId)
            .orElseThrow(() -> AppException.notFound("Delivery boy not found"));
        if (!db.getDistributor().getId().equals(distributor.getId()))
            throw AppException.forbidden("Not authorized");

        db.setName(req.getName());
        db.setMobile(req.getMobile());
        db.setAddress(req.getAddress());
        return toDeliveryBoyResponse(deliveryBoyRepository.save(db));
    }

    @Transactional
    public void deleteDeliveryBoy(Long distributorUserId, Long dbId) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        DeliveryBoy db = deliveryBoyRepository.findById(dbId)
            .orElseThrow(() -> AppException.notFound("Delivery boy not found"));
        if (!db.getDistributor().getId().equals(distributor.getId()))
            throw AppException.forbidden("Not authorized");
        db.setActive(false);
        deliveryBoyRepository.save(db);
    }

    // Customer Management
    @Transactional
    public CustomerResponse addCustomer(Long distributorUserId, CustomerRequest req) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        DeliveryBoy deliveryBoy = null;
        if (req.getDeliveryBoyId() != null) {
            deliveryBoy = deliveryBoyRepository.findById(req.getDeliveryBoyId())
                .orElseThrow(() -> AppException.notFound("Delivery boy not found"));
        }

        Customer customer = customerRepository.save(Customer.builder()
            .name(req.getName())
            .mobile(req.getMobile())
            .address(req.getAddress())
            .milkType(req.getMilkType())
            .defaultQuantity(req.getDefaultQuantity())
            .distributor(distributor)
            .deliveryBoy(deliveryBoy)
            .active(true)
            .build());

        return toCustomerResponse(customer);
    }

    public Page<CustomerResponse> getCustomers(Long distributorUserId, String search, Pageable pageable) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        if (search != null && !search.isBlank()) {
            return customerRepository.searchByDistributor(distributor, search, pageable)
                .map(this::toCustomerResponse);
        }
        return customerRepository.findByDistributorAndActive(distributor, true, pageable)
            .map(this::toCustomerResponse);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long distributorUserId, Long customerId, CustomerRequest req) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> AppException.notFound("Customer not found"));
        if (!customer.getDistributor().getId().equals(distributor.getId()))
            throw AppException.forbidden("Not authorized");

        customer.setName(req.getName());
        customer.setMobile(req.getMobile());
        customer.setAddress(req.getAddress());
        customer.setMilkType(req.getMilkType());
        customer.setDefaultQuantity(req.getDefaultQuantity());

        if (req.getDeliveryBoyId() != null) {
            DeliveryBoy db = deliveryBoyRepository.findById(req.getDeliveryBoyId())
                .orElseThrow(() -> AppException.notFound("Delivery boy not found"));
            customer.setDeliveryBoy(db);
        }

        return toCustomerResponse(customerRepository.save(customer));
    }

    // Milk Price Management
    @Transactional
    public void updateMilkPrice(Long distributorUserId, MilkPriceRequest req) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        milkPriceRepository.findByDistributorAndMilkTypeAndActive(distributor, req.getMilkType(), true)
            .ifPresent(p -> { p.setActive(false); milkPriceRepository.save(p); });

        milkPriceRepository.save(MilkPrice.builder()
            .distributor(distributor)
            .milkType(req.getMilkType())
            .pricePerLiter(req.getPricePerLiter())
            .active(true)
            .build());
    }

    public List<MilkPrice> getMilkPrices(Long distributorUserId) {
        return milkPriceRepository.findByDistributorAndActive(getDistributorByUserId(distributorUserId), true);
    }

    public CustomerResponse getCustomerById(Long distributorUserId, Long customerId) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> AppException.notFound("Customer not found"));
        if (!customer.getDistributor().getId().equals(distributor.getId()))
            throw AppException.forbidden("Not authorized");
        return toCustomerResponse(customer);
    }

    public Map<String, Object> getCustomerHistory(Long distributorUserId, Long customerId, int month, int year) {
        Distributor distributor = getDistributorByUserId(distributorUserId);
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> AppException.notFound("Customer not found"));
        if (!customer.getDistributor().getId().equals(distributor.getId()))
            throw AppException.forbidden("Not authorized");

        YearMonth ym = YearMonth.of(year, month);

        List<Map<String, Object>> deliveries = dailyDeliveryRepository
            .findByCustomerAndDeliveryDateBetween(customer, ym.atDay(1), ym.atEndOfMonth())
            .stream()
            .sorted(Comparator.comparing(DailyDelivery::getDeliveryDate))
            .map(d -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("date", d.getDeliveryDate().toString());
                m.put("quantity", d.getQuantity());
                m.put("pricePerLiter", d.getPricePerLiter());
                m.put("amount", d.getTotalAmount());
                m.put("status", d.getDeliveryStatus().name());
                return m;
            }).collect(Collectors.toList());

        List<Map<String, Object>> payments = paymentRepository
            .findByCustomerOrderByPaymentDateDesc(customer)
            .stream()
            .map(p -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("date", p.getPaymentDate().toString());
                m.put("amount", p.getAmount());
                m.put("mode", p.getPaymentMode().name());
                m.put("notes", p.getNotes());
                return m;
            }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("customer", toCustomerResponse(customer));
        result.put("deliveries", deliveries);
        result.put("payments", payments);
        return result;
    }

    private DeliveryBoyResponse toDeliveryBoyResponse(DeliveryBoy db) {
        long count = customerRepository.countByDistributorAndActive(db.getDistributor(), true);
        return DeliveryBoyResponse.builder()
            .id(db.getId())
            .name(db.getName())
            .mobile(db.getMobile())
            .address(db.getAddress())
            .username(db.getUser() != null ? db.getUser().getUsername() : null)
            .active(db.isActive())
            .customerCount(count)
            .createdAt(db.getCreatedAt())
            .build();
    }

    public CustomerResponse toCustomerResponse(Customer c) {
        return CustomerResponse.builder()
            .id(c.getId())
            .name(c.getName())
            .mobile(c.getMobile())
            .address(c.getAddress())
            .milkType(c.getMilkType())
            .defaultQuantity(c.getDefaultQuantity())
            .active(c.isActive())
            .deliveryBoyId(c.getDeliveryBoy() != null ? c.getDeliveryBoy().getId() : null)
            .deliveryBoyName(c.getDeliveryBoy() != null ? c.getDeliveryBoy().getName() : null)
            .pendingBalance(c.getPendingBalance())
            .createdAt(c.getCreatedAt())
            .build();
    }
}
