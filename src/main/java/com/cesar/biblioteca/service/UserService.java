package com.cesar.biblioteca.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cesar.biblioteca.dto.RegisterRequest;
import com.cesar.biblioteca.model.Role;
import com.cesar.biblioteca.model.User;
import com.cesar.biblioteca.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void saveNewLibrarian(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }

        String name = request.name() != null && request.name().trim().length() > 2 ? request.name().trim()  : null;
        String username = request.username() != null && request.username().trim().length() > 3 ? request.username().trim()  : null;;
        String password = request.password() != null && request.password().trim().length() > 5 ? passwordEncoder.encode(request.password().trim()) : null;
        
        if (name == null || username == null || password == null) {
            throw new RuntimeException("Fill in all fields");
        }

        User user = new User(
            name, username, password, Role.LIBRARIAN, null, null
        );

        userRepository.save(user);
    }
}
