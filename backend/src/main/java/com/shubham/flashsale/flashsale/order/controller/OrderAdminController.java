package com.shubham.flashsale.flashsale.order.controller;

import com.shubham.flashsale.flashsale.order.dto.OrderResponse;
import com.shubham.flashsale.flashsale.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class OrderAdminController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/users/{userUuid}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(
            @PathVariable UUID userUuid
    ) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userUuid.toString()));
    }
}
