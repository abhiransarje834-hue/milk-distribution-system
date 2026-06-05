package com.milkdist.repository;

import com.milkdist.entity.Customer;
import com.milkdist.entity.DeliveryBoy;
import com.milkdist.entity.Distributor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Page<Customer> findByDistributorAndActive(Distributor distributor, boolean active, Pageable pageable);
    List<Customer> findByDeliveryBoyAndActive(DeliveryBoy deliveryBoy, boolean active);
    List<Customer> findByDistributorAndActive(Distributor distributor, boolean active);

    @Query("SELECT c FROM Customer c WHERE c.distributor = :distributor AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%',:q,'%')) OR c.mobile LIKE CONCAT('%',:q,'%'))")
    Page<Customer> searchByDistributor(@Param("distributor") Distributor distributor,
                                       @Param("q") String query, Pageable pageable);

    long countByDistributorAndActive(Distributor distributor, boolean active);

    @Query("SELECT COALESCE(SUM(c.pendingBalance), 0) FROM Customer c WHERE c.distributor = :distributor AND c.active = true")
    BigDecimal sumPendingBalanceByDistributor(@Param("distributor") Distributor distributor);
}
