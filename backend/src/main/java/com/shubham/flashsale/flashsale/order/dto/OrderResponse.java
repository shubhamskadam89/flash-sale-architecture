package com.shubham.flashsale.flashsale.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {

    private String orderId;

    private String saleId;

    private String productId;

    private Integer quantity;

    private BigDecimal price;

    private String status;

    private Instant createdAt;

}