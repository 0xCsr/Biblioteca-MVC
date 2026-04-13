package com.cesar.biblioteca.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import com.cesar.biblioteca.dto.RegisterRequest;
import com.cesar.biblioteca.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void shouldAcceptValidUser() {
        when(userRepository.existsByUsername("john")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("encoded");

        RegisterRequest request = new RegisterRequest(
            "John",
            "john",
            "123456",
            null,
            null
        );

        assertDoesNotThrow(() -> userService.saveNewLibrarian(request));
        verify(userRepository).save(any());
    }

    @Test
    void shouldRejectEmptyUsername() {
        RegisterRequest request = new RegisterRequest(
            "John",
            "",
            "123456",
            null,
            null
        );

        assertThrows(RuntimeException.class, () -> userService.saveNewLibrarian(request));
    }

    @Test
    void shouldRejectNullUsername() {
        RegisterRequest request = new RegisterRequest(
            "John",
            null,
            "123456",
            null,
            null
        );

        assertThrows(RuntimeException.class, () -> userService.saveNewLibrarian(request));
    }
}