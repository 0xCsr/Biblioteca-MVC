package com.cesar.biblioteca.dto;

public record UpdateSupplierRequest(
    String name,
    String cnpj,
    String phone
) {
    
}
