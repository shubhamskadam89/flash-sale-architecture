# Rate Limiter Benchmark Results

This document records and analyzes the performance measurements of the three rate-limiting algorithms implemented in the Flash Sale Engine.

---

## Benchmark Configuration

* **Date:** 2026-07-02
* **Target Endpoint:** `POST /api/v1/sales/{saleUuid}/items/{saleItemUuid}/purchase`
* **Concurrency (Virtual Users):** 50
* **Duration:** 10s
* **Target Rate Limits Configuration (`application.yaml`):**
  * `max-requests`: 5
  * `window-seconds`: 60
  * `burst-capacity`: 5
  * `refill-rate`: 1 token/sec
* **Infrastructure:**
  * Redis: Dockerized redis:7 on localhost:6379
  * MySQL: Dockerized mysql:8.0 on localhost:3306
  * Application: JVM (Java 21) running on Host Machine (Tomcat, 100 Lettuce Connections)

---

## Comparative Results

The table below summarizes the key performance metrics collected for each algorithm under identical load conditions (VUs=50, Duration=10s):

| Metric | Fixed Window (`FIXED_WINDOW`) | Sliding Window (`SLIDING_WINDOW`) | Token Bucket (`TOKEN_BUCKET`) |
| :--- | :---: | :---: | :---: |
| **Total Requests Attempted** | 68,936 | 67,349 | 69,542 |
| **Allowed Requests (passed filter)** | 4 | 4 | **14** |
| **Blocked Requests (HTTP 429)** | 68,932 | 67,345 | 69,528 |
| **Average Latency (ms)** | **6.89 ms** | **7.09 ms** | **6.90 ms** |
| **P95 Latency (ms)** | **12.97 ms** | **13.25 ms** | **12.83 ms** |
| **Unexpected Responses (HTTP 500)**| 0 | **0** | 0 |

---

## Analysis & Key Takeaways

### 1. Token Bucket Real-Time Refill Validation
* The **Token Bucket** strategy allowed exactly **14 requests** over the course of the 10-second benchmark. This matches the theoretical limit: 5 (initial burst capacity) + 9 (refills of 1 token/sec during the 10-second test execution) = 14 tokens.
* **Fixed Window** and **Sliding Window** strictly capped the throughput to **4 requests** (due to the 60-second window bounds checking and auth setup timing), rejecting all others. This confirms that Token Bucket provides a smoother, more continuous request distribution for end users.

### 2. Sliding Window HTTP 500 Root Cause & Resolution
* **The Problem (Pipelining Connection Leaks):** Originally, `SlidingWindowStrategy` used Spring Data Redis `redisTemplate.executePipelined(...)` executing multiple ZSET operations (`ZREMRANGEBYSCORE`, `ZADD`, `ZCARD`, `EXPIRE`). Under extreme concurrency (50 VUs making continuous requests), pipelining state changes forced Lettuce to borrow/open dedicated TCP connections. This exhausted the Lettuce thread/connection pool, leading to Netty DNS timeouts, premature connection closures (`Connection closed prematurely`), and 868 unexpected HTTP 500 errors.
* **The Resolution (Atomic Lua Refactoring):** We refactored `SlidingWindowStrategy` to execute the ZSET operations atomically via a single Redis Lua script (`sliding_window.lua`). Executing the logic as a single unit allows Lettuce to reuse the shared native connection. This completely eliminated connection pool contention.
* **The Result:** Latency dropped **over 6x** (average latency reduced from 45.14 ms to **7.09 ms**, and P95 latency reduced from 234.25 ms to **13.25 ms**), throughput increased nearly 6-fold, and unexpected HTTP 500 errors dropped to **exactly 0**.

---

## Recommendation

For critical transactional endpoints like **Purchase (`/purchase`)**, the **`TOKEN_BUCKET`** algorithm is strongly recommended. It guarantees:
1. **Low overhead / sub-10ms response times** under heavy concurrency spikes.
2. **Smooth, fair throughput distribution** via continuous real-time token refills.
3. **No database connection exhaustion**, preventing cascading HTTP 500 errors in downstream services.
