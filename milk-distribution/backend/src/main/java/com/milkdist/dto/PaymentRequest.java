package com.milkdist.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {
    @NotNull
    private Long customerId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    private LocalDate paymentDate;

    private String paymentMode = "CASH";

    private Long billId;

    private String notes;
}
