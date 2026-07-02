package com.shubham.flashsale.flashsale.inventory.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {

    private UUID saleItemUuid;

    private Long remainingInventory;

    private String availability;

    private Instant asOf;

    private String source;
}
