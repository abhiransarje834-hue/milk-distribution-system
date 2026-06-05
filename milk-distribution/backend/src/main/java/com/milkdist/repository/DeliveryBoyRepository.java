package com.milkdist.repository;

import com.milkdist.entity.DeliveryBoy;
import com.milkdist.entity.Distributor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DeliveryBoyRepository extends JpaRepository<DeliveryBoy, Long> {
    List<DeliveryBoy> findByDistributorAndActive(Distributor distributor, boolean active);
    List<DeliveryBoy> findByDistributor(Distributor distributor);
    Optional<DeliveryBoy> findByUserId(Long userId);
    long countByDistributorAndActive(Distributor distributor, boolean active);
}
