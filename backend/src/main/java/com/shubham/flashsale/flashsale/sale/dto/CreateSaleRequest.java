package com.shubham.flashsale.flashsale.sale.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSaleRequest {

    private String name;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}