package com.shubham.flashsale.product.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;

    private String uuid;

    private String name;

    private String description;

    private BigDecimal basePrice;

    private java.util.Map<String, Object> metadata;

    private Boolean isActive;
}