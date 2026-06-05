package com.milkdist.dto;

import com.milkdist.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String name;
    private String mobile;
    private String address;
    private Customer.MilkType milkType;
    private BigDecimal defaultQuantity;
    private boolean active;
    private Long deliveryBoyId;
    private String deliveryBoyName;
    private BigDecimal pendingBalance;
    private LocalDateTime createdAt;
}
