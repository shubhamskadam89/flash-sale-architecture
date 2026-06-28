package com.shubham.flashsale.flashsale.order.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseResponse {

    private String orderId;

    private String saleId;

    private String productId;

    private Integer quantity;

    private Integer remainingInventory;

    private String message;

}