package com.shubham.flashsale.flashsale.order.entity;

import com.shubham.flashsale.user.entity.UserRole;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for {@link Order}
 */
public record OrderDto(String uuid, LocalDateTime createdAt, Long userId, String userUuid, LocalDateTime userCreatedAt,
                       LocalDateTime userUpdatedAt, LocalDateTime userDeletedAt, String userEmail, String userFullName,
                       String userPasswordHash, UserRole userRole, Boolean userIsActive, Long saleItemId,
                       String saleItemUuid, LocalDateTime saleItemCreatedAt, LocalDateTime saleItemUpdatedAt,
                       LocalDateTime saleItemDeletedAt, BigDecimal saleItemSalePrice, Long saleItemInventory,
                       Long saleItemFinalCount, Integer saleItemMaxPerUser, Integer quantity, BigDecimal unitPrice,
                       BigDecimal totalPrice, Status status) implements Serializable {
}