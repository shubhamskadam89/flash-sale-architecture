package com.shubham.flashsale.flashsale.sale.service;

import com.shubham.flashsale.exception.product.NoSuchProductException;
import com.shubham.flashsale.exception.sale.*;
import com.shubham.flashsale.flashsale.sale.dto.AddSaleItemRequest;
import com.shubham.flashsale.flashsale.sale.dto.CreateSaleRequest;
import com.shubham.flashsale.flashsale.sale.dto.SaleItemResponse;
import com.shubham.flashsale.flashsale.sale.dto.SaleResponse;
import com.shubham.flashsale.flashsale.sale.entity.SaleEvent;
import com.shubham.flashsale.flashsale.sale.entity.SaleItem;
import com.shubham.flashsale.flashsale.sale.entity.Status;
import com.shubham.flashsale.flashsale.sale.repository.SaleEventRepository;
import com.shubham.flashsale.flashsale.sale.repository.SaleItemRepository;
import com.shubham.flashsale.product.entity.Product;
import com.shubham.flashsale.product.repository.ProductRepository;
import com.shubham.flashsale.user.entity.User;
import com.shubham.flashsale.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class SaleServiceImpl implements SaleService {

    private final SaleEventRepository saleEventRepository;
    private final ProductRepository productRepository;
    private final SaleItemRepository saleItemRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SaleResponse createSale(CreateSaleRequest request) {

        log.debug("Validating sale request name={} startTime={} endTime={}",
                request.getName(), request.getStartTime(), request.getEndTime());
        validateSaleRequest(request);

        User currentUser = getCurrentUser();

        log.info("Creating sale campaign name={} by user={}",
                request.getName(), currentUser.getEmail());

        SaleEvent saleEvent = SaleEvent.builder()
                .name(request.getName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(Status.DRAFT)
                .createdBy(currentUser)
                .build();

        SaleEvent savedSale = saleEventRepository.save(saleEvent);

        log.info("Sale campaign created id={} uuid={}", savedSale.getId(), savedSale.getUuid());

        return SaleResponse.builder()
                .saleId(savedSale.getId())
                .saleUuid(savedSale.getUuid())
                .name(savedSale.getName())
                .startTime(savedSale.getStartTime())
                .endTime(savedSale.getEndTime())
                .status(savedSale.getStatus())
                .build();
    }

    @Override
    @Transactional
    public SaleItemResponse addItemToSale(Long saleId, AddSaleItemRequest request) {

        log.debug("Adding item to sale saleId={} productId={}", saleId, request.getProductId());

        SaleEvent saleEvent = saleEventRepository.findById(saleId)
                .orElseThrow(() -> {
                    log.warn("Sale event not found saleId={}", saleId);
                    return new SaleEventNotFoundException(saleId);
                });

        if (saleEvent.getStatus() != Status.DRAFT) {
            log.warn("Attempt to modify non-draft sale saleId={} status={}",
                    saleId, saleEvent.getStatus());
            throw new SaleAlreadyActiveException(saleId);
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> {
                    log.warn("Product not found productId={}", request.getProductId());
                    return new NoSuchProductException(request.getProductId());
                });

        log.debug("Validating sale item request productId={} salePrice={} inventory={}",
                product.getId(), request.getSalePrice(), request.getInventory());
        validateSaleItemRequest(request, product);

        if (saleItemRepository.existsBySaleEventAndProduct(saleEvent, product)) {
            log.warn("Duplicate product={} for sale={}", product.getId(), saleId);
            throw new DuplicateSaleItemException(saleId, product.getId());
        }

        SaleItem saleItem = SaleItem.builder()
                .saleEvent(saleEvent)
                .product(product)
                .salePrice(request.getSalePrice())
                .inventory(request.getInventory())
                .finalCount(0L)
                .maxPerUser(request.getMaxPerUser())
                .build();

        SaleItem savedItem = saleItemRepository.save(saleItem);

        log.info("Product={} added to sale={} saleItemId={} uuid={}",
                product.getId(), saleId, savedItem.getId(), savedItem.getUuid());

        return SaleItemResponse.builder()
                .saleItemId(savedItem.getId())
                .saleItemUuid(savedItem.getUuid())
                .saleEventId(saleEvent.getId())
                .productId(product.getId())
                .productName(product.getName())
                .salePrice(savedItem.getSalePrice())
                .inventory(savedItem.getInventory())
                .finalCount(savedItem.getFinalCount())
                .maxPerUser(savedItem.getMaxPerUser())
                .build();
    }

    @Override
    public SaleResponse activateSale(Long saleId) {
        log.warn("activateSale called but not yet implemented saleId={}", saleId);
        throw new UnsupportedOperationException("Will be implemented in Issue #11");
    }

    @Override
    public SaleResponse getSale(Long saleId) {
        log.debug("getSale called saleId={}", saleId);
        return null;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();

        // Spring's oauth2ResourceServer sets the principal as a Jwt token, NOT UserDetailsImpl.
        // We extract the subject claim (which is the user's email) and load the User from the DB.
        if (!(principal instanceof Jwt jwt)) {
            log.error("Principal is not a Jwt token. type={}", principal.getClass().getName());
            throw new AccessDeniedException("Authenticated user not found");
        }

        String email = jwt.getSubject();
        log.debug("Resolved current user email={} from JWT subject", email);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("No user found in DB for JWT subject email={}", email);
                    return new AccessDeniedException("User not found: " + email);
                });
    }

    private void validateSaleRequest(CreateSaleRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime())) {
            log.debug("Validation failed: end time before start time start={} end={}",
                    request.getStartTime(), request.getEndTime());
            throw new InvalidSaleException("End time must be after start time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            log.debug("Validation failed: start time in the past startTime={}", request.getStartTime());
            throw new InvalidSaleException("Sale cannot start in the past");
        }
    }

    private void validateSaleItemRequest(AddSaleItemRequest request, Product product) {
        if (request.getSalePrice().compareTo(BigDecimal.ZERO) <= 0) {
            log.debug("Validation failed: non-positive sale price={}", request.getSalePrice());
            throw new InvalidSaleItemException("Sale price must be positive");
        }

        if (request.getSalePrice().compareTo(product.getBasePrice()) > 0) {
            log.debug("Validation failed: sale price={} exceeds base price={}",
                    request.getSalePrice(), product.getBasePrice());
            throw new InvalidSaleItemException("Sale price cannot exceed base price");
        }

        if (request.getInventory() <= 0) {
            log.debug("Validation failed: non-positive inventory={}", request.getInventory());
            throw new InvalidSaleItemException("Inventory must be greater than zero");
        }

        if (request.getMaxPerUser() <= 0) {
            log.debug("Validation failed: non-positive maxPerUser={}", request.getMaxPerUser());
            throw new InvalidSaleItemException("Max per user must be greater than zero");
        }
    }
}