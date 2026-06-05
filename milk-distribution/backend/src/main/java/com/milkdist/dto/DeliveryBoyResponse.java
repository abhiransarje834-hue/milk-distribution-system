package com.milkdist.dto;

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
public class DeliveryBoyResponse {
    private Long id;
    private String name;
    private String mobile;
    private String address;
    private String username;
    private boolean active;
    private long customerCount;
    private LocalDateTime createdAt;
}
