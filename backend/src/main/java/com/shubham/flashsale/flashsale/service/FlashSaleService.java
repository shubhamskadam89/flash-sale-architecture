package com.shubham.flashsale.flashsale.service;

import com.shubham.flashsale.flashsale.dto.CreateSaleRequest;
import com.shubham.flashsale.flashsale.dto.SaleResponse;
import com.shubham.flashsale.flashsale.repository.SaleEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final SaleEventRepository saleEventRepository;

    public SaleResponse createSale(CreateSaleRequest request){

    }

    public SaleResponse activateSale(Long id){

    }
}