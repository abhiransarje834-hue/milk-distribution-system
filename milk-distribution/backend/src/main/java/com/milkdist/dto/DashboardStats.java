package com.milkdist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalCustomers;
    private long totalDeliveryBoys;
    private BigDecimal todaySale;
    private BigDecimal monthlySale;
    private BigDecimal monthlyRevenue;
    private BigDecimal pendingPayments;
    private BigDecimal todayQuantity;
    private BigDecimal monthlyQuantity;
}
