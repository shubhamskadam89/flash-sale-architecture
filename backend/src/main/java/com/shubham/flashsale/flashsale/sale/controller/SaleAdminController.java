package com.shubham.flashsale.flashsale.sale.controller;


import com.shubham.flashsale.flashsale.sale.dto.AddSaleItemRequest;
import com.shubham.flashsale.flashsale.sale.dto.CreateSaleRequest;
import com.shubham.flashsale.flashsale.sale.dto.SaleItemResponse;
import com.shubham.flashsale.flashsale.sale.dto.SaleResponse;
import com.shubham.flashsale.flashsale.sale.service.SaleService;
import com.shubham.flashsale.flashsale.sale.service.SaleServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/admin/sales")
@RequiredArgsConstructor
public class SaleAdminController {

    private final SaleService saleService;

    @PostMapping("/v1")
    public ResponseEntity<SaleResponse> createSaleRequest(@RequestBody CreateSaleRequest createSaleRequest){
        log.warn("1");
        return ResponseEntity.ok(saleService.createSale(createSaleRequest));
    }

    @PostMapping("/v1/{id}/activate")
    public ResponseEntity<SaleResponse> activateSale(@PathVariable Long id){
       return ResponseEntity.ok(saleService.activateSale(id));
    }
    @PostMapping("/v1/{saleId}/items")
    public ResponseEntity<SaleItemResponse> addItemToSale(
            @PathVariable Long saleId,
            @RequestBody AddSaleItemRequest request
    ){
        return ResponseEntity.ok(
                saleService.addItemToSale(saleId, request)
        );
    }
}