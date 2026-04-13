package com.cesar.biblioteca.dto;

import java.util.UUID;

import com.cesar.biblioteca.model.Supplier;

public record SupplierResponse(
    UUID id,
    String name,
    String cnpj,
    String phone
) {

    public static SupplierResponse toResponse(Supplier supplier) {
        return new SupplierResponse(
            supplier.getId(),
            supplier.getName(),
            supplier.getCnpj(),
            supplier.getPhone()
        );
    } 
}
