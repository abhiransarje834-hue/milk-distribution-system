package com.milkdist.service;

import com.milkdist.dto.*;
import com.milkdist.entity.*;
import com.milkdist.exception.AppException;
import com.milkdist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DistributorRepository distributorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public DistributorResponse addDistributor(DistributorRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw AppException.badRequest("Username already exists");
        if (distributorRepository.existsByMobile(req.getMobile()))
            throw AppException.badRequest("Mobile number already registered");

        User user = userRepository.save(User.builder()
            .username(req.getUsername())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(User.Role.DISTRIBUTOR)
            .active(false)
            .build());

        Distributor distributor = distributorRepository.save(Distributor.builder()
            .name(req.getName())
            .mobile(req.getMobile())
            .address(req.getAddress())
            .status(Distributor.Status.PENDING)
            .user(user)
            .build());

        return toResponse(distributor);
    }

    @Transactional
    public DistributorResponse updateStatus(Long id, Distributor.Status status) {
        Distributor distributor = distributorRepository.findById(id)
            .orElseThrow(() -> AppException.notFound("Distributor not found"));
        distributor.setStatus(status);
        distributor.getUser().setActive(status == Distributor.Status.ACTIVE || status == Distributor.Status.APPROVED);
        return toResponse(distributorRepository.save(distributor));
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        Distributor distributor = distributorRepository.findById(id)
            .orElseThrow(() -> AppException.notFound("Distributor not found"));
        distributor.getUser().setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(distributor.getUser());
    }

    public Page<DistributorResponse> getAllDistributors(Pageable pageable) {
        return distributorRepository.findAll(pageable).map(this::toResponse);
    }

    public DistributorResponse getDistributor(Long id) {
        return toResponse(distributorRepository.findById(id)
            .orElseThrow(() -> AppException.notFound("Distributor not found")));
    }

    private DistributorResponse toResponse(Distributor d) {
        return DistributorResponse.builder()
            .id(d.getId())
            .name(d.getName())
            .mobile(d.getMobile())
            .address(d.getAddress())
            .username(d.getUser().getUsername())
            .status(d.getStatus())
            .createdAt(d.getCreatedAt())
            .build();
    }
}
