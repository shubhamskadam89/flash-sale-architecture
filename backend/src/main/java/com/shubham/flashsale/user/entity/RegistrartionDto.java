package com.shubham.flashsale.user.entity;

import java.io.Serializable;

/**
 * DTO for {@link User}
 */
public record RegistrartionDto(
        String email,
        String password,
        UserRole role,
        String fullName) implements Serializable {
}