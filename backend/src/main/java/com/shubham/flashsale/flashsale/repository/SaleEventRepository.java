package com.shubham.flashsale.flashsale.repository;

import com.shubham.flashsale.flashsale.entity.SaleEvent;
import com.shubham.flashsale.flashsale.entity.Status;
import com.shubham.flashsale.product.entity.Product;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SaleEventRepository extends JpaRepository<SaleEvent,Long> {

    List<SaleEvent> findByStatus(Status status);

    List<SaleEvent> findByStatusAndStartTimeBefore(
            Status status,
            LocalDateTime now
    );

    List<SaleEvent> findByStatusAndEndTimeBefore(
            Status status,
            LocalDateTime now
    );
    
}