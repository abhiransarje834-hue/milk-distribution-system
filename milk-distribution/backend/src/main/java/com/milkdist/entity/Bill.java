package com.milkdist.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills",
    indexes = {
        @Index(name = "idx_bill_customer_month", columnList = "customer_id,bill_month,bill_year")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distributor_id", nullable = false)
    private Distributor distributor;

    @Column(nullable = false)
    private Integer billMonth;

    @Column(nullable = false)
    private Integer billYear;

    @Builder.Default
    private BigDecimal currentMonthAmount = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal previousPending = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BillStatus status = BillStatus.GENERATED;

    private LocalDate generatedDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum BillStatus {
        GENERATED, SENT, PAID, PARTIAL
    }
}
