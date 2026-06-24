package com.shubham.flashsale.flashsale.sale.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleItemResponse {

    private Long saleItemId;

    private String saleItemUuid;

    private Long saleEventId;

    private Long productId;

    private String productName;

    private BigDecimal salePrice;

    private Long inventory;

    private Long finalCount;

    private Integer maxPerUser;
}