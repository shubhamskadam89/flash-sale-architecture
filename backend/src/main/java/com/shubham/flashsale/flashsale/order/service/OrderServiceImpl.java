package com.shubham.flashsale.flashsale.order.service;


import com.shubham.flashsale.flashsale.order.dto.OrderResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService{
    @Override
    public OrderResponse getOrder(UUID id) {
        return null;
    }
}
