package com.cesar.biblioteca.dto;

import jakarta.validation.constraints.NotEmpty;

public record SupplierRequest(
    @NotEmpty(message = "Name cannot be blank")
    String name,

    @NotEmpty(message = "CNPJ cannot be blank")
    String cnpj,

    @NotEmpty(message = "Phone cannot be blank")
    String phone
) {
    
}
