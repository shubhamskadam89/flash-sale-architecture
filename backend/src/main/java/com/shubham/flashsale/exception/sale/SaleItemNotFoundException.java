package com.shubham.flashsale.exception.sale;

public class SaleItemNotFoundException extends RuntimeException {

    public SaleItemNotFoundException(Long saleItemId) {
        super("Sale item not found: " + saleItemId);
    }
}