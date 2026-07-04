package com.shubham.flashsale.ratelimit.dto;

import lombok.Getter;


public record RateLimitResult(
        boolean allowed,
        long limit,
        long currentCount,
        long remaining,
        Long retryAfterMs
){}
