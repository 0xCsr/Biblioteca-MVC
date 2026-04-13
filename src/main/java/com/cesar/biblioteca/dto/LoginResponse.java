package com.cesar.biblioteca.dto;

import java.util.UUID;

public record LoginResponse(
    String token,
    UUID id,
    String username,
    String role
) {
    
}
