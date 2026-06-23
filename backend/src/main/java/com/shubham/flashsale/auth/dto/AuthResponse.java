package com.shubham.flashsale.auth.dto;

import lombok.Data;

public record AuthResponse(
        String token,
        String tokenType,
        long expiresIn
)
{}
