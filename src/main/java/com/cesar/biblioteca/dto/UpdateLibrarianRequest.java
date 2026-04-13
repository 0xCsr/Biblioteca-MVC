package com.cesar.biblioteca.dto;

public record UpdateLibrarianRequest(
    String name,
    String username,
    String password
) {
    
}
