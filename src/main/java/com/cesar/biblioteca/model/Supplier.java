package com.cesar.biblioteca.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_suppliers")
public class Supplier extends BaseEntity {
    
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "cnpj", nullable = false, unique = true)
    private String cnpj;

    @Column(name = "phone", nullable = false, unique = true)
    private String phone;
    
    public Supplier() {
        super();
    }
    
    public Supplier(String name, String cnpj, String phone) {
        this.name = name;
        this.cnpj = cnpj;
        this.phone = phone;
    }
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
