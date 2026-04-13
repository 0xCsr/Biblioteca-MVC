package com.cesar.biblioteca.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cesar.biblioteca.dto.SupplierRequest;
import com.cesar.biblioteca.dto.SupplierResponse;
import com.cesar.biblioteca.dto.UpdateSupplierRequest;
import com.cesar.biblioteca.service.SupplierService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("suppliers")
public class SupplierController {
    
    private final SupplierService supplierService;
    
    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping
    public ResponseEntity<Void> save(@RequestBody @Valid SupplierRequest request) {
        supplierService.save(request);
        return ResponseEntity.status(201).build();
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> findAll() {
        return ResponseEntity.ok().body(supplierService.findAll());
    }

    @PatchMapping("/{supplierId}")
    public ResponseEntity<SupplierResponse> update(@RequestBody UpdateSupplierRequest request, @PathVariable UUID supplierId) {
        return ResponseEntity.ok().body(supplierService.update(request, supplierId));
    }
}
