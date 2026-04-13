package com.cesar.biblioteca.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cesar.biblioteca.model.Loan;

@Repository
public interface LoanRepository extends JpaRepository<Loan, UUID> {
    boolean existsByUserIdAndBookIdAndReturnDateIsNull(UUID userId, UUID bookId);
    List<Loan> findAllByUserId(UUID userId);
}
