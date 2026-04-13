package com.cesar.biblioteca.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cesar.biblioteca.dto.LoanRequest;
import com.cesar.biblioteca.dto.LoanResponse;
import com.cesar.biblioteca.service.LoanService;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/loans")
public class LoanController {
    
    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<Void> save(@RequestBody @Valid LoanRequest request) {
        loanService.save(request);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{loanId}/return-book")
    public ResponseEntity<Void> returnBook(@PathVariable UUID loanId) {
        loanService.returnBook(loanId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("{userId}")
    public ResponseEntity<List<LoanResponse>> findAllByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok().body(loanService.findAllByUserId(userId));
    }
    
}
