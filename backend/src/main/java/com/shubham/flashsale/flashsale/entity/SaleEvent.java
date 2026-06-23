package com.shubham.flashsale.flashsale.entity;

import com.shubham.flashsale.common.entity.BaseEntity;
import com.shubham.flashsale.product.entity.Product;
import com.shubham.flashsale.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.ForeignKey;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "sale_events",
        indexes = {
                @Index(name = "idx_status_start", columnList = "status,start_time"),
                @Index(name = "idx_uuid", columnList = "uuid"),
                @Index(name = "idx_current_stock", columnList = "total_inventory, final_count")
        }
)
public class SaleEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(
            name = "sale_price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal salePrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "total_inventory",nullable = false)
    private Long totalInventory;

    @Column(name = "final_count")
    private Long finalCount;

    @Column(name = "max_per_user",nullable = false)
    private Integer maxPerUser;

    @Column(name = "start_time",nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time",nullable = false)
    private LocalDateTime endTime;

    @Column(name = "status",nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

}

