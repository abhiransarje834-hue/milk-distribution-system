package com.milkdist.dto;

import com.milkdist.entity.Customer;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CustomerRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
    private String mobile;

    private String address;

    private Customer.MilkType milkType = Customer.MilkType.COW;

    @DecimalMin("0.5")
    private BigDecimal defaultQuantity = BigDecimal.ONE;

    private Long deliveryBoyId;
}
