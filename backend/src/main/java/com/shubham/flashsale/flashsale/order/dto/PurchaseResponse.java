package com.shubham.flashsale.flashsale.order.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseResponse {

    private Long orderId;

    private String orderUuid;

    private Long saleId;

    private Integer quantity;

    private Long remainingStock;

    private String message;
}