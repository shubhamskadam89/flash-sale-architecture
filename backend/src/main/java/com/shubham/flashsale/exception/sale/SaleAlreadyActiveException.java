package com.shubham.flashsale.exception.sale;

public class SaleAlreadyActiveException extends RuntimeException {

    public SaleAlreadyActiveException(Long saleId) {
        super("Sale already active: " + saleId);
    }
}

