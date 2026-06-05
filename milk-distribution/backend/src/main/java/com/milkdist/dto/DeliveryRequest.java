package com.milkdist.dto;

import com.milkdist.entity.DailyDelivery;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class DeliveryRequest {
    @NotNull
    private Long customerId;

    @NotNull
    private LocalDate deliveryDate;

    @DecimalMin("0")
    private BigDecimal quantity = BigDecimal.ZERO;

    private DailyDelivery.DeliveryStatus deliveryStatus = DailyDelivery.DeliveryStatus.DELIVERED;

    private String notes;
}
