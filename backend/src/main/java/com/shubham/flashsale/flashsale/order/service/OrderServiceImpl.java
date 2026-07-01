package com.shubham.flashsale.flashsale.order.service;

import com.shubham.flashsale.exception.purchase.OrderNotFoundException;
import com.shubham.flashsale.flashsale.order.dto.OrderResponse;
import com.shubham.flashsale.flashsale.order.entity.Order;
import com.shubham.flashsale.flashsale.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    public OrderResponse getOrder(String uuid) {

        Order order = orderRepository.findByUuid(uuid)
                .orElseThrow(() -> new OrderNotFoundException(uuid));

        return OrderResponse.builder()
                .orderUuid(UUID.fromString(order.getUuid()))
                .saleItemUuid(UUID.fromString(order.getSaleItem().getUuid()))
                .productUuid(UUID.fromString(order.getSaleItem().getProduct().getUuid()))
                .productName(order.getSaleItem().getProduct().getName())
                .quantity(order.getQuantity())
                .unitPrice(order.getUnitPrice())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt().toInstant(ZoneOffset.UTC))
                .build();
    }
}