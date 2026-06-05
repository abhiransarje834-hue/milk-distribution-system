package com.milkdist.dto;

import com.milkdist.entity.Customer;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MilkPriceRequest {
    @NotNull
    private Customer.MilkType milkType;

    @NotNull
    @DecimalMin("1.0")
    private BigDecimal pricePerLiter;
}
