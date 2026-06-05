package com.milkdist.repository;

import com.milkdist.entity.Distributor;
import com.milkdist.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DistributorRepository extends JpaRepository<Distributor, Long> {
    Optional<Distributor> findByUser(User user);
    Optional<Distributor> findByUserId(Long userId);
    Page<Distributor> findByStatus(Distributor.Status status, Pageable pageable);
    boolean existsByMobile(String mobile);
}
