package com.milkdist.repository;

import com.milkdist.entity.Customer;
import com.milkdist.entity.Distributor;
import com.milkdist.entity.MilkPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MilkPriceRepository extends JpaRepository<MilkPrice, Long> {
    Optional<MilkPrice> findByDistributorAndMilkTypeAndActive(Distributor distributor,
                                                               Customer.MilkType milkType, boolean active);
    List<MilkPrice> findByDistributorAndActive(Distributor distributor, boolean active);
}
