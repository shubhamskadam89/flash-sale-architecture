package com.shubham.flashsale.flashsale.sale.dto;

import com.shubham.flashsale.flashsale.sale.entity.Status;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleDetailResponse {

    private UUID saleUuid;

    private String name;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Status status;

    private List<SaleItemResponse> items;
}
