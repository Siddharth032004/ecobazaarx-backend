package com.ecobazaarx.controller;

import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.service.ProductService;
import com.ecobazaarx.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final com.ecobazaarx.service.CarbonBaselineService carbonBaselineService;
    private final com.ecobazaarx.service.CarbonCalculator carbonCalculator;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ProductController.class);

    private ProductDto enrichDto(ProductDto dto) {
        if (dto != null) {
            logger.info("Trace Product: ID={}, Name={}, CarbonFootprint={}", dto.getId(), dto.getName(),
                    dto.getCarbonFootprintPerUnit());
        }

        if (dto == null || dto.getCategoryName() == null || dto.getCarbonFootprintPerUnit() == null) {
            return dto;
        }

        Double baseline = carbonBaselineService.getBaselineForCategory(dto.getCategoryName());
        Double ecoCF = dto.getCarbonFootprintPerUnit();

        // Rules:
        // if ecoCF >= baseline (or baseline <= 0): NONE/SIMILAR?
        // User rule: if ecoCF > baseline: hide (NONE). if ecoCF == baseline: SIMILAR.
        // if ecoCF < baseline: calculate percentage.
        // if pct >= 5 -> LOWER. else -> SIMILAR.

        if (baseline <= 0) {
            dto.setCo2ComparisonType("NONE");
            return dto;
        }

        double diff = baseline - ecoCF;

        if (diff < 0) {
            dto.setCo2ComparisonType("NONE");
        } else if (diff == 0) {
            dto.setCo2ComparisonType("SIMILAR");
        } else {
            // diff > 0, means ecoCF < baseline
            double pct = (diff / baseline) * 100.0;
            dto.setCo2ComparisonPercentage(Math.round(pct * 10.0) / 10.0); // round to 1 decimal

            if (pct >= 5.0) {
                dto.setCo2ComparisonType("LOWER");
            } else {
                dto.setCo2ComparisonType("SIMILAR");
            }
        }
        return dto;
    }

    @GetMapping
    public Page<ProductDto> getAll(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return search(null, page, size);
    }

    @GetMapping("/search")
    public Page<ProductDto> search(@RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return productService.search(query, page, size)
                .map(MapperUtil::toProductDto)
                .map(this::enrichDto);
    }

    @GetMapping("/filter")
    public Page<ProductDto> filter(@RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return productService.filter(category, minPrice, maxPrice, page, size)
                .map(MapperUtil::toProductDto)
                .map(this::enrichDto);
    }

    @GetMapping("/featured")
    public java.util.List<ProductDto> getFeaturedProducts() {
        return productService.getFeaturedProducts(8).stream()
                .map(MapperUtil::toProductDto)
                .map(this::enrichDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> get(@PathVariable Long id) {
        Product p = productService.getById(id);
        return ResponseEntity.ok(enrichDto(MapperUtil.toProductDto(p)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductDto> getBySlug(@PathVariable String slug) {
        try {
            Product p = productService.getBySlug(slug);
            return ResponseEntity.ok(enrichDto(MapperUtil.toProductDto(p)));
        } catch (Exception e) {
            logger.error("Error fetching product by slug: " + slug, e);
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<ProductDto> create(@RequestBody ProductDto dto, Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        // Calculate Carbon Footprint if inputs are provided
        if (dto.getEcoInputs() != null) {
            double footprint = carbonCalculator.calculateFootprint(dto.getEcoInputs());
            dto.setCarbonFootprintPerUnit(footprint);
        }

        Product p = MapperUtil.fromProductDto(dto);
        Product saved = productService.create(p, user);
        return ResponseEntity.ok(enrichDto(MapperUtil.toProductDto(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> update(@PathVariable Long id, @RequestBody ProductDto dto,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        // Calculate Carbon Footprint if inputs are provided
        if (dto.getEcoInputs() != null) {
            double footprint = carbonCalculator.calculateFootprint(dto.getEcoInputs());
            dto.setCarbonFootprintPerUnit(footprint);
        }

        Product p = MapperUtil.fromProductDto(dto);
        Product updated = productService.update(id, p, user);
        return ResponseEntity.ok(enrichDto(MapperUtil.toProductDto(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        productService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}
