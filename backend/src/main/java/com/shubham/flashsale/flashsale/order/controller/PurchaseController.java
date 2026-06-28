package com.shubham.flashsale.flashsale.order.controller;

import com.shubham.flashsale.flashsale.order.dto.PurchaseRequest;
import com.shubham.flashsale.flashsale.order.dto.PurchaseResponse;
import com.shubham.flashsale.flashsale.order.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping("/{saleId}/purchase")
    public PurchaseResponse purchase(
            @PathVariable String saleId,
            @Valid @RequestBody PurchaseRequest request) {

        return purchaseService.purchase(saleId, request);
    }


}