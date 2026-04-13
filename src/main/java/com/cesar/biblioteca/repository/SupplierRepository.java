package com.cesar.biblioteca.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cesar.biblioteca.model.Supplier;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    boolean existsByName(String name);
    Optional<Supplier> getByName(String name);
    
}
