package com.cesar.biblioteca.dto;

import java.time.LocalDate;

public record BookRequest(
    String title,
    String author,
    String publisher,
    LocalDate publicationDate,
    String genre,
    Integer quantity
) {
    
}
