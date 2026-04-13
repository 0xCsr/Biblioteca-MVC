package com.cesar.biblioteca.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.cesar.biblioteca.dto.SupplierRequest;
import com.cesar.biblioteca.dto.SupplierResponse;
import com.cesar.biblioteca.dto.UpdateSupplierRequest;
import com.cesar.biblioteca.model.Supplier;
import com.cesar.biblioteca.repository.SupplierRepository;

@Service
public class SupplierService {
    
    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public void save(SupplierRequest request) {
        if (supplierRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Supplier already exists");
        }

        String name = request.name() != null ? request.name().trim() : null;
        String cnpj = request.cnpj() != null ? request.cnpj().trim() : null;
        String phone = request.phone() != null ? request.phone().trim() : null;

        if (name == null || name.isBlank()
                || cnpj == null || cnpj.isBlank()
                || phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Fill in all fields");
        }

        Supplier supplier = new Supplier(name, cnpj, phone);
        supplierRepository.save(supplier);
    }

    public List<SupplierResponse> findAll() {
        return supplierRepository.findAll().stream()
            .map(SupplierResponse::toResponse)
            .toList();
    }

    public SupplierResponse update(UpdateSupplierRequest request, UUID supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));

        String name = request.name() != null ? request.name().trim() : null;
        String cnpj = request.cnpj() != null ? request.cnpj().trim() : null;
        String phone = request.phone() != null ? request.phone().trim() : null;

        if (name == null || name.isBlank()
                || cnpj == null || cnpj.isBlank()
                || phone == null || phone.isBlank()) {
            throw new RuntimeException("Fill in all fields");
        }

        if (!name.equals(supplier.getName())) supplier.setName(name);
        if (!cnpj.equals(supplier.getCnpj())) supplier.setCnpj(cnpj);
        if (!phone.equals(supplier.getPhone())) supplier.setPhone(phone);

        supplierRepository.save(supplier);
        return SupplierResponse.toResponse(supplier);
    }

    public void deleteById(UUID supplierId) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new RuntimeException("Supplier not found");
        }

        supplierRepository.deleteById(supplierId);
    }
}