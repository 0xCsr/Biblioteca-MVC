package com.cesar.biblioteca.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.doAnswer;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import com.cesar.biblioteca.dto.LoanRequest;
import com.cesar.biblioteca.model.Book;
import com.cesar.biblioteca.model.Loan;
import com.cesar.biblioteca.model.Role;
import com.cesar.biblioteca.model.Supplier;
import com.cesar.biblioteca.model.User;
import com.cesar.biblioteca.repository.BookRepository;
import com.cesar.biblioteca.repository.LoanRepository;
import com.cesar.biblioteca.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookRepository bookRepository;

    private LoanService loanService;

    @BeforeEach
    void setUp() {
        loanService = new LoanService(loanRepository, userRepository, bookRepository);
    }

    @Test
    void shouldAllowBorrowWhenStockExists() {
        UUID userId = UUID.randomUUID();
        UUID bookId = UUID.randomUUID();

        User user = new User("John", "john", "123456", Role.USER, "Rua A", "11999999999");
        Supplier supplier = new Supplier("Fornecedor", "12345678000199", "11999999999");
        Book book = new Book(
            "Livro",
            "Autor",
            "Editora",
            LocalDate.now().minusDays(1),
            "Gênero",
            supplier,
            3
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
        when(loanRepository.existsByUserIdAndBookIdAndReturnDateIsNull(userId, bookId)).thenReturn(false);

        LoanRequest request = new LoanRequest(userId, bookId);

        assertDoesNotThrow(() -> loanService.save(request));
        verify(loanRepository).save(any());
        verify(bookRepository).save(book);
        assertTrue(book.getQuantity() == 2);
    }

    @Test
    void shouldRejectBorrowWhenNoStock() {
        UUID userId = UUID.randomUUID();
        UUID bookId = UUID.randomUUID();

        User user = new User("John", "john", "123456", Role.USER, "Rua A", "11999999999");
        Supplier supplier = new Supplier("Fornecedor", "12345678000199", "11999999999");
        Book book = new Book(
            "Livro",
            "Autor",
            "Editora",
            LocalDate.now().minusDays(1),
            "Gênero",
            supplier,
            0
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));

        LoanRequest request = new LoanRequest(userId, bookId);

        assertThrows(RuntimeException.class, () -> loanService.save(request));
    }

    @Test
    void shouldAcceptValidLoanDays() {
        UUID userId = UUID.randomUUID();
        UUID bookId = UUID.randomUUID();

        User user = new User("John", "john", "123456", Role.USER, "Rua A", "11999999999");
        Supplier supplier = new Supplier("Fornecedor", "12345678000199", "11999999999");
        Book book = new Book(
            "Livro",
            "Autor",
            "Editora",
            LocalDate.now().minusDays(1),
            "Gênero",
            supplier,
            2
        );

        AtomicReference<Loan> savedLoan = new AtomicReference<>();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
        when(loanRepository.existsByUserIdAndBookIdAndReturnDateIsNull(userId, bookId)).thenReturn(false);

        doAnswer(invocation -> {
            Loan loan = invocation.getArgument(0);
            savedLoan.set(loan);
            return null;
        }).when(loanRepository).save(any(Loan.class));

        LoanRequest request = new LoanRequest(userId, bookId);

        assertDoesNotThrow(() -> loanService.save(request));

        Loan loan = savedLoan.get();
        assertTrue(loan != null);
        assertTrue(!loan.getDueDate().isBefore(loan.getLoanDate().plusDays(1)));
        assertTrue(!loan.getDueDate().isAfter(loan.getLoanDate().plusDays(7)));
    }
}