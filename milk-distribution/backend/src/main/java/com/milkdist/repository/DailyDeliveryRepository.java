package com.milkdist.repository;

import com.milkdist.entity.Customer;
import com.milkdist.entity.DailyDelivery;
import com.milkdist.entity.DeliveryBoy;
import com.milkdist.entity.Distributor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyDeliveryRepository extends JpaRepository<DailyDelivery, Long> {

    Optional<DailyDelivery> findByCustomerAndDeliveryDate(Customer customer, LocalDate date);

    List<DailyDelivery> findByDistributorAndDeliveryDate(Distributor distributor, LocalDate date);

    List<DailyDelivery> findByDeliveryBoyAndDeliveryDate(DeliveryBoy deliveryBoy, LocalDate date);

    List<DailyDelivery> findByCustomerAndDeliveryDateBetween(Customer customer, LocalDate start, LocalDate end);

    List<DailyDelivery> findByDistributorAndDeliveryDateBetween(Distributor distributor, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(d.totalAmount), 0) FROM DailyDelivery d " +
           "WHERE d.distributor = :distributor AND d.deliveryDate = :date AND d.deliveryStatus = 'DELIVERED'")
    BigDecimal sumTotalAmountByDistributorAndDate(@Param("distributor") Distributor distributor,
                                                  @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(d.totalAmount), 0) FROM DailyDelivery d " +
           "WHERE d.distributor = :distributor AND d.deliveryDate BETWEEN :start AND :end " +
           "AND d.deliveryStatus = 'DELIVERED'")
    BigDecimal sumTotalAmountByDistributorAndDateRange(@Param("distributor") Distributor distributor,
                                                       @Param("start") LocalDate start,
                                                       @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(d.quantity), 0) FROM DailyDelivery d " +
           "WHERE d.distributor = :distributor AND d.deliveryDate BETWEEN :start AND :end " +
           "AND d.deliveryStatus = 'DELIVERED'")
    BigDecimal sumQuantityByDistributorAndDateRange(@Param("distributor") Distributor distributor,
                                                    @Param("start") LocalDate start,
                                                    @Param("end") LocalDate end);

    @Query("SELECT d.deliveryBoy.id, d.deliveryBoy.name, COUNT(d), COALESCE(SUM(d.quantity),0) " +
           "FROM DailyDelivery d WHERE d.distributor = :distributor " +
           "AND d.deliveryDate BETWEEN :start AND :end AND d.deliveryStatus = 'DELIVERED' " +
           "GROUP BY d.deliveryBoy.id, d.deliveryBoy.name")
    List<Object[]> getDeliveryBoyPerformance(@Param("distributor") Distributor distributor,
                                              @Param("start") LocalDate start,
                                              @Param("end") LocalDate end);

    Optional<DailyDelivery> findTopByCustomerOrderByDeliveryDateDesc(Customer customer);
}
