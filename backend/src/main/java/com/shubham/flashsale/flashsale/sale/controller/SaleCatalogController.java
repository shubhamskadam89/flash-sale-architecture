package com.shubham.flashsale.flashsale.sale.controller;

import com.shubham.flashsale.flashsale.sale.dto.SaleDetailResponse;
import com.shubham.flashsale.flashsale.sale.dto.SaleItemResponse;
import com.shubham.flashsale.flashsale.sale.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
public class SaleCatalogController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<List<SaleDetailResponse>> getAvailableSales() {
        return ResponseEntity.ok(saleService.getAvailableSales());
    }

    @GetMapping("/{saleUuid}")
    public ResponseEntity<SaleDetailResponse> getSale(
            @PathVariable UUID saleUuid
    ) {
        return ResponseEntity.ok(saleService.getSaleDetail(saleUuid.toString()));
    }

    @GetMapping("/{saleUuid}/items")
    public ResponseEntity<List<SaleItemResponse>> getSaleItems(
            @PathVariable UUID saleUuid
    ) {
        return ResponseEntity.ok(saleService.getSaleItems(saleUuid.toString()));
    }
}
