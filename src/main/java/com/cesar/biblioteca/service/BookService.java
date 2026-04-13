package com.cesar.biblioteca.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.cesar.biblioteca.dto.BookRequest;
import com.cesar.biblioteca.dto.BookResponse;
import com.cesar.biblioteca.dto.UpdateBookRequest;
import com.cesar.biblioteca.model.Book;
import com.cesar.biblioteca.model.Supplier;
import com.cesar.biblioteca.repository.BookRepository;
import com.cesar.biblioteca.repository.SupplierRepository;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final SupplierRepository supplierRepository;

    public BookService(BookRepository bookRepository, SupplierRepository supplierRepository) {
        this.bookRepository = bookRepository;
        this.supplierRepository = supplierRepository;
    }

    public void save(BookRequest request, UUID supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
            .orElseThrow(() -> new UsernameNotFoundException("Supplier not found"));

        String title = request.title() != null ? request.title().trim() : null;
        String author = request.author() != null ? request.author().trim() : null;
        String publisher = request.publisher() != null ? request.publisher().trim() : null;
        LocalDate publicationDate = request.publicationDate() != null && request.publicationDate().isBefore(LocalDate.now())
            ? request.publicationDate()
            : null;
        String genre = request.genre() != null ? request.genre().trim() : null;
        Integer quantity = request.quantity() != null && request.quantity() >= 0 ? request.quantity() : null;

        if (title == null || title.isBlank()
                || author == null || author.isBlank()
                || publisher == null || publisher.isBlank()
                || genre == null || genre.isBlank()) {
            throw new IllegalArgumentException("Fill in all fields");
        }

        if (publicationDate == null) {
            throw new IllegalArgumentException("Date must be earlier than today");
        }

        if (quantity == null) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        Book book = new Book(title, author, publisher, publicationDate, genre, supplier, quantity);
        bookRepository.save(book);
    }

    public List<BookResponse> findAll() {
        return bookRepository.findAll().stream()
            .filter(f -> f.getQuantity() > 0)
            .map(BookResponse::toResponse)
            .toList();
    }

    public BookResponse update(UpdateBookRequest request, UUID bookId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new UsernameNotFoundException("Book not found"));

        String title = request.title() != null ? request.title().trim() : null;
        String author = request.author() != null ? request.author().trim() : null;
        String publisher = request.publisher() != null ? request.publisher().trim() : null;
        LocalDate publicationDate = request.publicationDate() != null && request.publicationDate().isBefore(LocalDate.now())
            ? request.publicationDate()
            : null;
        String genre = request.genre() != null ? request.genre().trim() : null;
        Integer quantity = request.quantity() != null && request.quantity() >= 0 ? request.quantity() : null;

        if (title == null || title.isBlank()
                || author == null || author.isBlank()
                || publisher == null || publisher.isBlank()
                || genre == null || genre.isBlank()) {
            throw new RuntimeException("Fill in all fields");
        }

        if (publicationDate == null) {
            throw new RuntimeException("Date must be earlier than today");
        }

        if (quantity == null) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (!title.equals(book.getTitle())) book.setTitle(title);
        if (!author.equals(book.getAuthor())) book.setAuthor(author);
        if (!publisher.equals(book.getPublisher())) book.setPublisher(publisher);
        if (!publicationDate.equals(book.getPublicationDate())) book.setPublicationDate(publicationDate);
        if (!genre.equals(book.getGenre())) book.setGenre(genre);
        if (!quantity.equals(book.getQuantity())) book.setQuantity(quantity);

        bookRepository.save(book);
        return BookResponse.toResponse(book);
    }

    public void delete(UUID bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new RuntimeException("Book not found");
        }

        bookRepository.deleteById(bookId);
    }
}