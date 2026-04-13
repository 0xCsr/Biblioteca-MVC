package com.cesar.biblioteca.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.cesar.biblioteca.model.Loan;

public record LoanResponse(
    UUID id,
    String title,
    String author,
    String publisher,
    String genre,
    LocalDate dueDate
) {
    
    public static LoanResponse toResponse(Loan loan) {
        return new LoanResponse(
            loan.getId(),
            loan.getBook().getTitle(),
            loan.getBook().getAuthor(),
            loan.getBook().getPublisher(),
            loan.getBook().getGenre(),
            loan.getDueDate()
        );
    }
}
