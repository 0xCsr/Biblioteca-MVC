package com.cesar.biblioteca.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.cesar.biblioteca.dto.LoanRequest;
import com.cesar.biblioteca.dto.LoanResponse;
import com.cesar.biblioteca.model.Book;
import com.cesar.biblioteca.model.Loan;
import com.cesar.biblioteca.model.User;
import com.cesar.biblioteca.repository.BookRepository;
import com.cesar.biblioteca.repository.LoanRepository;
import com.cesar.biblioteca.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class LoanService {
    
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    
    public LoanService(LoanRepository loanRepository, UserRepository userRepository, BookRepository bookRepository) {
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    @Transactional
    public void save(LoanRequest request) {
        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Book book = bookRepository.findById(request.bookId())
            .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getQuantity() < 1) {
            throw new RuntimeException("No available copies of this book");
        }

        if (loanRepository.existsByUserIdAndBookIdAndReturnDateIsNull(request.userId(), request.bookId())) {
            throw new RuntimeException("You already have this book borrowed");
        }

        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBook(book);
        loan.setLoanDate(LocalDate.now());
        loan.setDueDate(loan.getLoanDate().plusDays(7));

        book.setQuantity(book.getQuantity() - 1);

        loanRepository.save(loan);
        bookRepository.save(book);
    }

    public List<LoanResponse> findAllByUserId(UUID userId) {
        return loanRepository.findAllByUserId(userId).stream()
            .filter(f -> f.getReturnDate() == null)
            .map(LoanResponse::toResponse)
            .toList();
    }

    @Transactional
    public void returnBook(UUID loanId) {

        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new RuntimeException("Loan not found"));

        if (loan.getReturnDate() != null) {
            throw new IllegalStateException("This book is already returned");
        }

        Book book = loan.getBook();

        loan.setReturnDate(LocalDate.now());

        book.setQuantity(book.getQuantity() + 1);

        loanRepository.save(loan);
        bookRepository.save(book);
    }
}
