package com.shubham.flashsale.flashsale.controller;

import com.shubham.flashsale.flashsale.dto.CreateSaleRequest;
import com.shubham.flashsale.flashsale.dto.SaleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController("/api/admin/sale")
@RequiredArgsConstructor
public class SaleAdminController {

    @PostMapping("/v1")
    public ResponseEntity<SaleResponse> createSaleRequest(@RequestBody CreateSaleRequest createSaleRequest){
        ResponseEntity.ok(new SaleResponse());
    }

    @PostMapping("/v1/{id}/activate")
    public ResponseEntity<SaleResponse> activateSale(@PathVariable Long id){
        ResponseEntity.ok(new SaleResponse());
    }
}