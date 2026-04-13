package com.cesar.biblioteca.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.cesar.biblioteca.model.Book;

public record BookResponse(
    UUID id,
    UUID supplierId,
    String title,
    String author,
    String publisher,
    LocalDate publicationDate,
    String genre,
    Integer quantity
) {
    
    public static BookResponse toResponse(Book book) {
        return new BookResponse(
            book.getId(),
            book.getSupplier().getId(),
            book.getTitle(),
            book.getAuthor(),
            book.getPublisher(),
            book.getPublicationDate(),
            book.getGenre(),
            book.getQuantity()
        );
    }
}
