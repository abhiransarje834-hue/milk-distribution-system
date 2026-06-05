package com.milkdist.dto;

import com.milkdist.entity.Customer;
import com.milkdist.entity.DailyDelivery;
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
public class DeliveryResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerMobile;
    private Long deliveryBoyId;
    private String deliveryBoyName;
    private LocalDate deliveryDate;
    private Customer.MilkType milkType;
    private BigDecimal quantity;
    private BigDecimal pricePerLiter;
    private BigDecimal totalAmount;
    private DailyDelivery.DeliveryStatus deliveryStatus;
    private String notes;
}
