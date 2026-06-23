package com.shubham.flashsale.user.dto;

import com.shubham.flashsale.user.entity.UserRole;

import java.io.Serializable;

/**
 * DTO for {@link com.shubham.flashsale.user.entity.User}
 */
public record UserResponseDto(
        String uuid,
        String email,
        UserRole role,
        Boolean isActive) implements Serializable {
}