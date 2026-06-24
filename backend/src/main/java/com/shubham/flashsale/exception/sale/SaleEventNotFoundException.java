package com.shubham.flashsale.exception.sale;

public class SaleEventNotFoundException extends RuntimeException {

    public SaleEventNotFoundException(Long saleId) {
        super("Sale event not found: " + saleId);
    }
}