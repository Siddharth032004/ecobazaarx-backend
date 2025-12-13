package com.ecobazaarx.controller;

import com.ecobazaarx.entity.Brand;
import com.ecobazaarx.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {
    private final BrandRepository brandRepository;

    @GetMapping
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Brand createBrand(@RequestBody Brand brand) {
        return brandRepository.save(brand);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Brand updateBrand(@PathVariable Long id, @RequestBody Brand brand) {
        Brand existing = brandRepository.findById(id).orElseThrow();
        existing.setName(brand.getName());
        existing.setSlug(brand.getSlug());
        existing.setImageUrl(brand.getImageUrl());
        return brandRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBrand(@PathVariable Long id) {
        brandRepository.deleteById(id);
    }
}
