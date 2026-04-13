package com.cesar.biblioteca.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotEmpty(message = "Name cannot be blank")
    String name,

    @NotEmpty(message = "Username cannot be blank")
    String username,

    @NotEmpty(message = "Password cannot be blank")
    @Size(min = 4, message = "Password must have at least 4 characters")
    String password,

    String address,
    String phone
) {

}
