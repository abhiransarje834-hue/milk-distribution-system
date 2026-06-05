package com.milkdist.repository;

import com.milkdist.entity.Customer;
import com.milkdist.entity.Distributor;
import com.milkdist.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustomerOrderByPaymentDateDesc(Customer customer);
    List<Payment> findByDistributorAndPaymentDateBetween(Distributor distributor, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.customer = :customer AND p.bill.id = :billId")
    BigDecimal sumByCustomerAndBill(@Param("customer") Customer customer, @Param("billId") Long billId);
}
