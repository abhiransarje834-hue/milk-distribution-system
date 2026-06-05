package com.milkdist.service;

import com.milkdist.dto.*;
import com.milkdist.entity.*;
import com.milkdist.exception.AppException;
import com.milkdist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DailyDeliveryRepository deliveryRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryBoyRepository deliveryBoyRepository;
    private final DistributorRepository distributorRepository;
    private final MilkPriceRepository milkPriceRepository;

    @Transactional
    public DeliveryResponse saveDelivery(Long userId, User.Role role, DeliveryRequest req) {
        Customer customer = customerRepository.findById(req.getCustomerId())
            .orElseThrow(() -> AppException.notFound("Customer not found"));

        DeliveryBoy deliveryBoy = null;
        if (role == User.Role.DELIVERY_BOY) {
            deliveryBoy = deliveryBoyRepository.findByUserId(userId)
                .orElseThrow(() -> AppException.notFound("Delivery boy not found"));
            if (!customer.getDeliveryBoy().getId().equals(deliveryBoy.getId()))
                throw AppException.forbidden("Customer not assigned to you");
        }

        Distributor distributor = customer.getDistributor();
        BigDecimal price = milkPriceRepository
            .findByDistributorAndMilkTypeAndActive(distributor, customer.getMilkType(), true)
            .map(MilkPrice::getPricePerLiter)
            .orElse(BigDecimal.ZERO);

        BigDecimal total = req.getDeliveryStatus() == DailyDelivery.DeliveryStatus.DELIVERED
            ? req.getQuantity().multiply(price) : BigDecimal.ZERO;

        DailyDelivery delivery = deliveryRepository
            .findByCustomerAndDeliveryDate(customer, req.getDeliveryDate())
            .orElse(DailyDelivery.builder().customer(customer).distributor(distributor).build());

        delivery.setDeliveryBoy(deliveryBoy != null ? deliveryBoy : customer.getDeliveryBoy());
        delivery.setDeliveryDate(req.getDeliveryDate());
        delivery.setMilkType(customer.getMilkType());
        delivery.setQuantity(req.getQuantity());
        delivery.setPricePerLiter(price);
        delivery.setTotalAmount(total);
        delivery.setDeliveryStatus(req.getDeliveryStatus());
        delivery.setNotes(req.getNotes());

        return toResponse(deliveryRepository.save(delivery));
    }

    public List<DeliveryResponse> getDeliveriesForDate(Long userId, User.Role role, LocalDate date) {
        if (role == User.Role.DELIVERY_BOY) {
            DeliveryBoy db = deliveryBoyRepository.findByUserId(userId)
                .orElseThrow(() -> AppException.notFound("Delivery boy not found"));
            return deliveryRepository.findByDeliveryBoyAndDeliveryDate(db, date)
                .stream().map(this::toResponse).toList();
        } else {
            Distributor distributor = distributorRepository.findByUserId(userId)
                .orElseThrow(() -> AppException.notFound("Distributor not found"));
            return deliveryRepository.findByDistributorAndDeliveryDate(distributor, date)
                .stream().map(this::toResponse).toList();
        }
    }

    public List<DeliveryResponse> getCustomerDeliveries(Long customerId, LocalDate start, LocalDate end) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> AppException.notFound("Customer not found"));
        return deliveryRepository.findByCustomerAndDeliveryDateBetween(customer, start, end)
            .stream().map(this::toResponse).toList();
    }

    public List<CustomerResponse> getAssignedCustomers(Long userId) {
        DeliveryBoy db = deliveryBoyRepository.findByUserId(userId)
            .orElseThrow(() -> AppException.notFound("Delivery boy not found"));
        return customerRepository.findByDeliveryBoyAndActive(db, true)
            .stream().map(c -> CustomerResponse.builder()
                .id(c.getId()).name(c.getName()).mobile(c.getMobile())
                .address(c.getAddress()).milkType(c.getMilkType())
                .defaultQuantity(c.getDefaultQuantity()).active(c.isActive())
                .pendingBalance(c.getPendingBalance()).build())
            .toList();
    }

    @Transactional
    public CustomerResponse addCustomerByDeliveryBoy(Long userId, CustomerRequest req) {
        DeliveryBoy db = deliveryBoyRepository.findByUserId(userId)
            .orElseThrow(() -> AppException.notFound("Delivery boy not found"));
        Customer customer = customerRepository.save(Customer.builder()
            .name(req.getName())
            .mobile(req.getMobile())
            .address(req.getAddress())
            .milkType(req.getMilkType())
            .defaultQuantity(req.getDefaultQuantity())
            .distributor(db.getDistributor())
            .deliveryBoy(db)
            .active(true)
            .build());
        return CustomerResponse.builder()
            .id(customer.getId()).name(customer.getName()).mobile(customer.getMobile())
            .address(customer.getAddress()).milkType(customer.getMilkType())
            .defaultQuantity(customer.getDefaultQuantity()).active(customer.isActive())
            .deliveryBoyId(db.getId()).deliveryBoyName(db.getName())
            .pendingBalance(customer.getPendingBalance()).build();
    }

    private DeliveryResponse toResponse(DailyDelivery d) {
        return DeliveryResponse.builder()
            .id(d.getId())
            .customerId(d.getCustomer().getId())
            .customerName(d.getCustomer().getName())
            .customerMobile(d.getCustomer().getMobile())
            .deliveryBoyId(d.getDeliveryBoy() != null ? d.getDeliveryBoy().getId() : null)
            .deliveryBoyName(d.getDeliveryBoy() != null ? d.getDeliveryBoy().getName() : null)
            .deliveryDate(d.getDeliveryDate())
            .milkType(d.getMilkType())
            .quantity(d.getQuantity())
            .pricePerLiter(d.getPricePerLiter())
            .totalAmount(d.getTotalAmount())
            .deliveryStatus(d.getDeliveryStatus())
            .notes(d.getNotes())
            .build();
    }
}
