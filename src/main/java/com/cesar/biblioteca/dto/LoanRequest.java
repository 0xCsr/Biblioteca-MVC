package com.cesar.biblioteca.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record LoanRequest(
    @NotNull(message = "User ID cannot be null")
    UUID userId,

    @NotNull(message = "Book ID cannot be null")
    UUID bookId
) {
    
}
