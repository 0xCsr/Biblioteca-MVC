package com.cesar.biblioteca.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import com.cesar.biblioteca.dto.BookRequest;
import com.cesar.biblioteca.model.Supplier;
import com.cesar.biblioteca.repository.BookRepository;
import com.cesar.biblioteca.repository.SupplierRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private SupplierRepository supplierRepository;

    private BookService bookService;

    @BeforeEach
    void setUp() {
        bookService = new BookService(bookRepository, supplierRepository);
    }

    @Test
    void shouldAcceptValidBook() {
        UUID supplierId = UUID.randomUUID();
        Supplier supplier = new Supplier("Fornecedor A", "12345678000199", "11999999999");

        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(supplier));

        BookRequest request = new BookRequest(
            "Clean Code",
            "Robert C. Martin",
            "Prentice Hall",
            LocalDate.now().minusDays(1),
            "Programação",
            2
        );

        assertDoesNotThrow(() -> bookService.save(request, supplierId));
        verify(bookRepository).save(any());
    }

    @Test
    void shouldRejectBookWithEmptyTitle() {
        UUID supplierId = UUID.randomUUID();
        Supplier supplier = new Supplier("Fornecedor A", "12345678000199", "11999999999");

        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(supplier));

        BookRequest request = new BookRequest(
            "",
            "Autor",
            "Editora",
            LocalDate.now().minusDays(1),
            "Gênero",
            2
        );

        assertThrows(IllegalArgumentException.class, () -> bookService.save(request, supplierId));
    }

    @Test
    void shouldRejectBookWithNegativeQuantity() {
        UUID supplierId = UUID.randomUUID();
        Supplier supplier = new Supplier("Fornecedor A", "12345678000199", "11999999999");

        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(supplier));

        BookRequest request = new BookRequest(
            "Java",
            "Autor",
            "Editora",
            LocalDate.now().minusDays(1),
            "Tecnologia",
            -1
        );

        assertThrows(IllegalArgumentException.class, () -> bookService.save(request, supplierId));
    }
}