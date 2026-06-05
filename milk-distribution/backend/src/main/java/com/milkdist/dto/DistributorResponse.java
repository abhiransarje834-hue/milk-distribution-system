package com.milkdist.dto;

import com.milkdist.entity.Distributor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistributorResponse {
    private Long id;
    private String name;
    private String mobile;
    private String address;
    private String username;
    private Distributor.Status status;
    private LocalDateTime createdAt;
}
