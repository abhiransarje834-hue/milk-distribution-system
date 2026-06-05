package com.milkdist.dto;

import com.milkdist.entity.Bill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerMobile;
    private String deliveryBoyName;
    private String distributorName;
    private int billMonth;
    private int billYear;
    private BigDecimal currentMonthAmount;
    private BigDecimal previousPending;
    private BigDecimal paidAmount;
    private BigDecimal totalAmount;
    private BigDecimal remainingAmount;
    private Bill.BillStatus status;
    private LocalDate generatedDate;
    private String whatsappMessage;
}
