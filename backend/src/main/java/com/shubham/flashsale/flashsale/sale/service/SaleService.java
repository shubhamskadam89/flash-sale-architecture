package com.shubham.flashsale.flashsale.sale.service;


import com.shubham.flashsale.flashsale.sale.dto.AddSaleItemRequest;
import com.shubham.flashsale.flashsale.sale.dto.CreateSaleRequest;
import com.shubham.flashsale.flashsale.sale.dto.SaleItemResponse;
import com.shubham.flashsale.flashsale.sale.dto.SaleResponse;

public interface SaleService {


    SaleResponse createSale(
            CreateSaleRequest request
    );

    SaleItemResponse addItemToSale(
            Long saleId,
            AddSaleItemRequest request
    );

    SaleResponse activateSale(
            Long saleId
    );

    SaleResponse getSale(Long saleId);
}