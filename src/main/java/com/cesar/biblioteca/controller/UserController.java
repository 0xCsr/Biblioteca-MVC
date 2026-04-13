package com.cesar.biblioteca.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cesar.biblioteca.dto.RegisterRequest;
import com.cesar.biblioteca.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/users")
public class UserController {
    
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/librarians")
    public ResponseEntity<Void> saveNewLibrarian(@RequestBody @Valid RegisterRequest request) {
        userService.saveNewLibrarian(request);
        return ResponseEntity.status(201).build();
    }
}
