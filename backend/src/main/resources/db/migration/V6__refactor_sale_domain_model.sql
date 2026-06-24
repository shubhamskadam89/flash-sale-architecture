DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sale_events;

-- =====================================================
-- sale_events
-- =====================================================
CREATE TABLE sale_events (
                             id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                             uuid        VARCHAR(36)  NOT NULL UNIQUE,
                             name        VARCHAR(255) NOT NULL,
                             start_time  DATETIME(3)  NOT NULL,
                             end_time    DATETIME(3)  NOT NULL,
                             status      ENUM('DRAFT','ACTIVE','ENDED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
                             created_by  BIGINT UNSIGNED NOT NULL,
                             created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                             updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                 ON UPDATE CURRENT_TIMESTAMP(3),
                             deleted_at  DATETIME(3)  NULL,

                             CONSTRAINT fk_sale_event_creator
                                 FOREIGN KEY (created_by) REFERENCES users (id),

                             INDEX idx_status_start (status, start_time),
                             INDEX idx_uuid         (uuid),
                             INDEX idx_deleted_at   (deleted_at)
);

-- =====================================================
-- sale_items
-- =====================================================
CREATE TABLE sale_items (
                            id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                            uuid          VARCHAR(36)     NOT NULL UNIQUE,
                            sale_event_id BIGINT UNSIGNED NOT NULL,
                            product_id    BIGINT UNSIGNED NOT NULL,
                            sale_price    DECIMAL(12,2)   NOT NULL,
                            inventory     BIGINT UNSIGNED NOT NULL,
                            final_count   BIGINT UNSIGNED NULL,
                            max_per_user  INT             NOT NULL DEFAULT 1,
                            created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                            updated_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                ON UPDATE CURRENT_TIMESTAMP(3),
                            deleted_at    DATETIME(3)     NULL,

                            CONSTRAINT fk_sale_item_sale_event
                                FOREIGN KEY (sale_event_id) REFERENCES sale_events (id),
                            CONSTRAINT fk_sale_item_product
                                FOREIGN KEY (product_id)    REFERENCES products (id),

                            UNIQUE INDEX uq_sale_product (sale_event_id, product_id),
                            INDEX idx_sale_event (sale_event_id),
                            INDEX idx_product    (product_id),
                            INDEX idx_deleted_at (deleted_at)
);

-- =====================================================
-- orders
-- =====================================================
CREATE TABLE orders (
                        id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                        uuid            VARCHAR(36)     NOT NULL UNIQUE,
                        user_id         BIGINT UNSIGNED NOT NULL,
                        sale_item_id    BIGINT UNSIGNED NOT NULL,
                        quantity        INT             NOT NULL DEFAULT 1,
                        unit_price      DECIMAL(12,2)   NOT NULL,
                        total_price     DECIMAL(12,2)   NOT NULL,
                        status          ENUM('PENDING','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
                        idempotency_key VARCHAR(36)     NOT NULL UNIQUE,
                        created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                        updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                            ON UPDATE CURRENT_TIMESTAMP(3),
                        deleted_at      DATETIME(3)     NULL,

                        CONSTRAINT fk_order_user
                            FOREIGN KEY (user_id)      REFERENCES users (id),
                        CONSTRAINT fk_order_sale_item
                            FOREIGN KEY (sale_item_id) REFERENCES sale_items (id),

                        INDEX idx_user_sale_item (user_id, sale_item_id),
                        INDEX idx_sale_item      (sale_item_id),
                        INDEX idx_idempotency    (idempotency_key),
                        INDEX idx_created_at     (created_at),
                        INDEX idx_deleted_at     (deleted_at)
);