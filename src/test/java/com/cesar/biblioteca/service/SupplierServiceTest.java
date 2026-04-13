package com.cesar.biblioteca.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import com.cesar.biblioteca.dto.SupplierRequest;
import com.cesar.biblioteca.repository.SupplierRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    private SupplierService supplierService;

    @BeforeEach
    void setUp() {
        supplierService = new SupplierService(supplierRepository);
    }

    @Test
    void shouldAcceptValidSupplier() {
        when(supplierRepository.existsByName("Fornecedor X")).thenReturn(false);

        SupplierRequest request = new SupplierRequest(
            "Fornecedor X",
            "12.345.678/0001-99",
            "11999999999"
        );

        assertDoesNotThrow(() -> supplierService.save(request));
        verify(supplierRepository).save(any());
    }

    @Test
    void shouldRejectEmptyCnpj() {
        when(supplierRepository.existsByName("Fornecedor X")).thenReturn(false);

        SupplierRequest request = new SupplierRequest(
            "Fornecedor X",
            "",
            "11999999999"
        );

        assertThrows(IllegalArgumentException.class, () -> supplierService.save(request));
    }

    @Test
    void shouldRejectNullCnpj() {
        when(supplierRepository.existsByName("Fornecedor X")).thenReturn(false);

        SupplierRequest request = new SupplierRequest(
            "Fornecedor X",
            null,
            "11999999999"
        );

        assertThrows(IllegalArgumentException.class, () -> supplierService.save(request));
    }
}