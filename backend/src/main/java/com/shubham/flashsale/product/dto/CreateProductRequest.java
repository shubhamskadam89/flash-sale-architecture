package com.shubham.flashsale.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal basePrice;

    private java.util.Map<String, Object> metadata;
}