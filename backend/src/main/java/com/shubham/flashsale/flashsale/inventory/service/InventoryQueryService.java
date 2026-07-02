package com.shubham.flashsale.flashsale.inventory.service;

import com.shubham.flashsale.common.redis.RedisKeyBuilder;
import com.shubham.flashsale.exception.inventory.InventoryStateUnavailableException;
import com.shubham.flashsale.exception.sale.SaleItemNotFoundException;
import com.shubham.flashsale.flashsale.inventory.dto.InventoryResponse;
import com.shubham.flashsale.flashsale.sale.entity.SaleEvent;
import com.shubham.flashsale.flashsale.sale.entity.SaleItem;
import com.shubham.flashsale.flashsale.sale.entity.Status;
import com.shubham.flashsale.flashsale.sale.repository.SaleItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryQueryService {

    private final SaleItemRepository saleItemRepository;
    private final StringRedisTemplate redisTemplate;

    public InventoryResponse getInventory(String saleItemUuid) {
        SaleItem saleItem = saleItemRepository.findByUuid(saleItemUuid)
                .orElseThrow(() -> new SaleItemNotFoundException(saleItemUuid));
        SaleEvent saleEvent = saleItem.getSaleEvent();
        Instant asOf = Instant.now();

        if (saleEvent.getStatus() == Status.ENDED || saleEvent.getEndTime().isBefore(LocalDateTime.now())) {
            return InventoryResponse.builder()
                    .saleItemUuid(UUID.fromString(saleItem.getUuid()))
                    .remainingInventory(null)
                    .availability("SALE_ENDED")
                    .asOf(asOf)
                    .source("UNAVAILABLE")
                    .build();
        }

        if (saleEvent.getStatus() != Status.ACTIVE) {
            return InventoryResponse.builder()
                    .saleItemUuid(UUID.fromString(saleItem.getUuid()))
                    .remainingInventory(saleItem.getInventory())
                    .availability("NOT_ACTIVE")
                    .asOf(asOf)
                    .source("DATABASE_INITIAL")
                    .build();
        }

        String redisValue = redisTemplate.opsForValue()
                .get(RedisKeyBuilder.inventory(saleItem.getUuid()));

        if (redisValue != null) {
            long remainingInventory = Long.parseLong(redisValue);
            return InventoryResponse.builder()
                    .saleItemUuid(UUID.fromString(saleItem.getUuid()))
                    .remainingInventory(remainingInventory)
                    .availability(remainingInventory <= 0 ? "SOLD_OUT" : "AVAILABLE")
                    .asOf(asOf)
                    .source("REDIS")
                    .build();
        }

        throw new InventoryStateUnavailableException(saleItem.getUuid());
    }
}
