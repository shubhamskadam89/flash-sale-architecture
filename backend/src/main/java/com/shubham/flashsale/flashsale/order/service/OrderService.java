package com.shubham.flashsale.flashsale.order.service;


import com.shubham.flashsale.flashsale.order.dto.OrderResponse;

import java.util.UUID;

public interface OrderService {

    OrderResponse getOrder(UUID id);
}