package com.shubham.flashsale.exception.product;

public class NoSuchProductException
        extends RuntimeException {

    public NoSuchProductException(
            Long productId
    ) {

        super(
                "Product not found: " +
                        productId
        );
    }
}