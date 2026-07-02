package com.shubham.flashsale.flashsale.order.repository;

import com.shubham.flashsale.flashsale.order.entity.Order;
import com.shubham.flashsale.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order,Long> {
    Optional<Order> findByUuid(String uuid);

    Optional<Order> findByIdempotencyKey(String key);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByUserOrderByCreatedAtDesc(User user);
}
