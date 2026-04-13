package com.cesar.biblioteca.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cesar.biblioteca.dto.BookRequest;
import com.cesar.biblioteca.dto.BookResponse;
import com.cesar.biblioteca.dto.UpdateBookRequest;
import com.cesar.biblioteca.service.BookService;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/books")
public class BookController {
    
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping("/supplier/{supplierId}")
    public ResponseEntity<Void> save(@RequestBody @Valid BookRequest request, @PathVariable UUID supplierId) {
        bookService.save(request, supplierId);
        return ResponseEntity.status(201).build();
    }
    
    @GetMapping
    public ResponseEntity<List<BookResponse>> findAll() {
        return ResponseEntity.ok().body(bookService.findAll());
    }

    @PatchMapping("{bookId}")
    public ResponseEntity<BookResponse> update(@RequestBody @Valid UpdateBookRequest request, @PathVariable UUID bookId) {
        return ResponseEntity.ok().body(bookService.update(request, bookId));
    }

    @DeleteMapping("{bookId}")
    public ResponseEntity<Void> deleteById(@PathVariable UUID bookId) {
        bookService.delete(bookId);
        return ResponseEntity.noContent().build();
    }
}
