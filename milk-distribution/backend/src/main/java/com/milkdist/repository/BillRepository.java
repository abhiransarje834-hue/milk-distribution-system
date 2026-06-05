package com.milkdist.repository;

import com.milkdist.entity.Bill;
import com.milkdist.entity.Customer;
import com.milkdist.entity.Distributor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByCustomerAndBillMonthAndBillYear(Customer customer, int month, int year);
    List<Bill> findByDistributorAndBillMonthAndBillYear(Distributor distributor, int month, int year);
    Page<Bill> findByDistributor(Distributor distributor, Pageable pageable);

    @Query("SELECT COALESCE(SUM(b.remainingAmount), 0) FROM Bill b WHERE b.distributor = :distributor AND b.remainingAmount > 0")
    BigDecimal sumPendingByDistributor(@Param("distributor") Distributor distributor);
}
