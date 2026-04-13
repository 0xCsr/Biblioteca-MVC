package com.cesar.biblioteca.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cesar.biblioteca.dto.LoginRequest;
import com.cesar.biblioteca.dto.LoginResponse;
import com.cesar.biblioteca.dto.RegisterRequest;
import com.cesar.biblioteca.dto.UserAuthenticated;
import com.cesar.biblioteca.model.Role;
import com.cesar.biblioteca.model.User;
import com.cesar.biblioteca.repository.UserRepository;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("User already exists");
        }

        String name = request.name() != null ? request.name().trim() : null;
        String username = request.username() != null ? request.username().trim() : null;
        String password = request.password() != null ? passwordEncoder.encode(request.password().trim()) : null;
        String address = request.address() != null ? request.address().trim() : null;
        String phone = request.phone() != null ? request.phone().trim() : null;

        if (name == null || username == null || password == null || address == null || phone == null) {
            throw new IllegalArgumentException("Fill in all fields");
        }

        User user = new User(name, username, password, Role.USER, address, phone);
        userRepository.save(user);

        return "User registered successfully";
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        UserAuthenticated authenticatedUser = (UserAuthenticated) authentication.getPrincipal();
        User user = authenticatedUser.getUser();

        return new LoginResponse(
            jwtService.generateToken(authentication),
            user.getId(),
            user.getUsername(),
            user.getRole().name()
        );
    }
}
