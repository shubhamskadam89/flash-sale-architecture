package com.shubham.flashsale.flashsale.sale.dto;


import com.shubham.flashsale.flashsale.sale.entity.Status;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleResponse {

    private Long saleId;

    private String saleUuid;

    private String name;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Status status;
}