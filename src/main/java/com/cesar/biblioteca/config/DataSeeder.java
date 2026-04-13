package com.cesar.biblioteca.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.cesar.biblioteca.model.Role;
import com.cesar.biblioteca.model.User;
import com.cesar.biblioteca.repository.UserRepository;

@Configuration
public class DataSeeder {
    
    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder encoder) {
        return args -> {

            if (!userRepository.existsByUsername("admin")) {
                User admin = new User(
                    "Admin",
                    "admin",
                    encoder.encode("admin"),
                    Role.ADMIN,
                    "system",
                    "000000000"
                );

                userRepository.save(admin);
            }

            if (!userRepository.existsByUsername("librarian")) {
                User librarian = new User(
                    "Librarian",
                    "librarian",
                    encoder.encode("librarian"),
                    Role.LIBRARIAN,
                    "system",
                    "000000000"
                );

                userRepository.save(librarian);
            }
        };
    }
}
