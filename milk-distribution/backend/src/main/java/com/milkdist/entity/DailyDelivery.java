package com.milkdist.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_deliveries",
    indexes = {
        @Index(name = "idx_delivery_date", columnList = "delivery_date"),
        @Index(name = "idx_customer_date", columnList = "customer_id,delivery_date"),
        @Index(name = "idx_distributor_date", columnList = "distributor_id,delivery_date")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distributor_id", nullable = false)
    private Distributor distributor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_boy_id")
    private DeliveryBoy deliveryBoy;

    @Column(nullable = false)
    private LocalDate deliveryDate;

    @Enumerated(EnumType.STRING)
    private Customer.MilkType milkType;

    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal pricePerLiter = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DeliveryStatus deliveryStatus = DeliveryStatus.DELIVERED;

    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum DeliveryStatus {
        DELIVERED, SKIPPED, HOLIDAY, PAUSED
    }
}
