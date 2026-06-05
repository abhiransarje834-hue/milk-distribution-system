package com.milkdist.service;

import com.milkdist.dto.*;
import com.milkdist.entity.*;
import com.milkdist.exception.AppException;
import com.milkdist.repository.*;
import com.milkdist.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final DistributorRepository distributorRepository;
    private final DeliveryBoyRepository deliveryBoyRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> AppException.notFound("User not found"));

        if (!user.isActive()) throw AppException.forbidden("Account is deactivated");

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails, Map.of("role", user.getRole().name()));

        AuthResponse.AuthResponseBuilder builder = AuthResponse.builder()
            .token(token)
            .username(user.getUsername())
            .role(user.getRole().name())
            .userId(user.getId());

        if (user.getRole() == User.Role.DISTRIBUTOR) {
            distributorRepository.findByUser(user).ifPresent(d -> {
                builder.profileId(d.getId()).name(d.getName());
            });
        } else if (user.getRole() == User.Role.DELIVERY_BOY) {
            deliveryBoyRepository.findByUserId(user.getId()).ifPresent(db -> {
                builder.profileId(db.getId()).name(db.getName());
            });
        } else {
            builder.name("Admin");
        }

        return builder.build();
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> AppException.notFound("User not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword()))
            throw AppException.badRequest("Old password is incorrect");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
