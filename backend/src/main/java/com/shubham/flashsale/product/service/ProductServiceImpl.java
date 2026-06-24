package com.shubham.flashsale.product.service;

import com.shubham.flashsale.exception.product.NoSuchProductException;
import com.shubham.flashsale.product.dto.CreateProductRequest;
import com.shubham.flashsale.product.dto.ProductResponse;
import com.shubham.flashsale.product.entity.Product;
import com.shubham.flashsale.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public ProductResponse createProduct(
            CreateProductRequest request
    ) {

        log.info(
                "Creating product name={}",
                request.getName()
        );

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .metadata(request.getMetadata())
                .isActive(true)
                .build();

        Product savedProduct =
                productRepository.save(product);

        log.info(
                "Product created id={} uuid={}",
                savedProduct.getId(),
                savedProduct.getUuid()
        );

        return mapToResponse(savedProduct);
    }

    @Override
    public ProductResponse getProduct(
            Long productId
    ) {

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(
                                () -> new NoSuchProductException(productId)
                        );

        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ProductResponse mapToResponse(
            Product product
    ) {

        return ProductResponse.builder()
                .id(product.getId())
                .uuid(product.getUuid())
                .name(product.getName())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .metadata(product.getMetadata())
                .isActive(product.getIsActive())
                .build();
    }
}