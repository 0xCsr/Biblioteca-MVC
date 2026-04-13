package com.cesar.biblioteca.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotEmpty(message = "Username cannot be blank")
    String username,

    @Size(min = 4, message = "Password must be least 4 characters")
    String password
) {
    
}
