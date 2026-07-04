package com.shubham.flashsale.product.controller;

import com.shubham.flashsale.product.dto.CreateProductRequest;
import com.shubham.flashsale.product.dto.ProductResponse;
import com.shubham.flashsale.product.service.ProductService;
import com.shubham.flashsale.ratelimit.resolver.policy.RateLimitPolicy;
import com.shubham.flashsale.ratelimit.annotation.RateLimit;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @RateLimit(policy = RateLimitPolicy.ADMIN)
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request
    ) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @GetMapping("/{productUuid}")
    @RateLimit(policy = RateLimitPolicy.GENERAL)
    public ResponseEntity<ProductResponse> getProduct(
            @PathVariable UUID productUuid
    ) {
        return ResponseEntity.ok(productService.getProduct(productUuid.toString()));
    }

    @GetMapping
    @RateLimit(policy = RateLimitPolicy.GENERAL)
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
}