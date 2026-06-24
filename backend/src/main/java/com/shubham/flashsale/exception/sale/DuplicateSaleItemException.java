package com.shubham.flashsale.exception.sale;

public class DuplicateSaleItemException extends RuntimeException {

    public DuplicateSaleItemException(Long saleId, Long productId) {
        super(
                "Product " + productId +
                        " already exists in sale " + saleId
        );
    }
}