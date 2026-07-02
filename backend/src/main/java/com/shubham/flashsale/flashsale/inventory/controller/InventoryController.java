package com.shubham.flashsale.flashsale.inventory.controller;

import com.shubham.flashsale.flashsale.inventory.dto.InventoryResponse;
import com.shubham.flashsale.flashsale.inventory.service.InventoryQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sale-items")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryQueryService inventoryQueryService;

    @GetMapping("/{saleItemUuid}/inventory")
    public ResponseEntity<InventoryResponse> getInventory(
            @PathVariable UUID saleItemUuid
    ) {
        return ResponseEntity.ok(
                inventoryQueryService.getInventory(saleItemUuid.toString())
        );
    }
}
