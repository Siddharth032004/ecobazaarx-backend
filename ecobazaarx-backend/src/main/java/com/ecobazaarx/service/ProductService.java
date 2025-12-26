package com.ecobazaarx.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {
  private final ProductRepository productRepository;

  public Page<Product> search(String query, Integer page, Integer size) {
    Pageable p = PageRequest.of(page, size);
    if (query == null || query.isBlank())
      return productRepository.findAll(p);
    return productRepository.findByNameContainingIgnoreCase(query, p);
  }

  public Page<Product> filter(String category, Double minPrice, Double maxPrice, int page, int size) {
    Pageable p = PageRequest.of(page, size);
    if (category != null && !category.isEmpty()) {
      return productRepository.findByCategoryNameIgnoreCase(category, p);
    }
    if (minPrice != null && maxPrice != null) {
      return productRepository.findByPriceBetween(minPrice, maxPrice, p);
    }
    return productRepository.findAll(p);
  }

  public java.util.List<Product> getAllProducts() {
    return productRepository.findAll();
  }

  public java.util.List<Product> getFeaturedProducts(int limit) {
    return productRepository.findByIsFeaturedTrue(PageRequest.of(0, limit)).getContent();
  }

  public Product getById(Long id) {
    return productRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
  }

  public Product getBySlug(String slug) {
    java.util.Optional<Product> op = productRepository.findBySlug(slug);
    if (op.isPresent()) {
      return op.get();
    }

    // Fallback: Check if slug has :ID suffix and try base slug
    if (slug != null && slug.contains(":")) {
      String baseSlug = slug.substring(0, slug.lastIndexOf(':'));
      op = productRepository.findBySlug(baseSlug);
      if (op.isPresent()) {
        return op.get();
      }
    }

    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
  }

  private final CarbonBaselineService carbonBaselineService;

  private void calculateCarbonSaved(Product product) {
    if (product.getCarbonFootprintPerUnit() != null) {
      Double base = carbonBaselineService.getBaselineForCategory(product.getCategoryName());
      double saved = base - product.getCarbonFootprintPerUnit();
      product.setCarbonSavedPerItem(Math.max(0.0, saved));
    } else {
      product.setCarbonSavedPerItem(0.0);
    }
  }

  public Product create(Product product, User seller) {
    // Link product to seller
    product.setSeller(seller);
    // Set sellerStoreName for backward compatibility
    if (product.getSellerStoreName() == null && seller != null) {
      product.setSellerStoreName(seller.getName());
    }

    // Calculate CO2 savings
    calculateCarbonSaved(product);

    return productRepository.save(product);
  }

  public Product update(Long productId, Product updatedProduct, User user) {
    Product existing = getById(productId);

    // Check if user is admin or the product's seller
    if (!user.getRole().equals("ADMIN") &&
        (existing.getSeller() == null || !existing.getSeller().getId().equals(user.getId()))) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own products");
    }

    // Update fields
    if (updatedProduct.getName() != null)
      existing.setName(updatedProduct.getName());
    if (updatedProduct.getCategoryName() != null)
      existing.setCategoryName(updatedProduct.getCategoryName());
    if (updatedProduct.getBrand() != null)
      existing.setBrand(updatedProduct.getBrand());
    if (updatedProduct.getPrice() != null)
      existing.setPrice(updatedProduct.getPrice());
    if (updatedProduct.getStockQuantity() != null)
      existing.setStockQuantity(updatedProduct.getStockQuantity());
    if (updatedProduct.getImageUrl() != null)
      existing.setImageUrl(updatedProduct.getImageUrl());
    if (updatedProduct.getCarbonFootprintPerUnit() != null)
      existing.setCarbonFootprintPerUnit(updatedProduct.getCarbonFootprintPerUnit());

    // Recalculate savings if footprint or category changed (using updated values or
    // falling back to existing)
    if (updatedProduct.getCarbonFootprintPerUnit() != null || updatedProduct.getCategoryName() != null) {
      calculateCarbonSaved(existing);
    }

    if (updatedProduct.getSlug() != null)
      existing.setSlug(updatedProduct.getSlug());
    if (updatedProduct.getMrp() != null)
      existing.setMrp(updatedProduct.getMrp());
    if (updatedProduct.getRating() != null)
      existing.setRating(updatedProduct.getRating());
    if (updatedProduct.getDiscountPercent() != null)
      existing.setDiscountPercent(updatedProduct.getDiscountPercent());
    if (updatedProduct.getIsFeatured() != null)
      existing.setIsFeatured(updatedProduct.getIsFeatured());
    if (updatedProduct.getImages() != null)
      existing.setImages(updatedProduct.getImages());
    if (updatedProduct.getCity() != null)
      existing.setCity(updatedProduct.getCity());
    if (updatedProduct.getState() != null)
      existing.setState(updatedProduct.getState());

    return productRepository.save(existing);
  }

  public void delete(Long productId, User user) {
    Product product = getById(productId);

    // Check if user is admin or the product's seller
    if (!user.getRole().equals("ADMIN") &&
        (product.getSeller() == null || !product.getSeller().getId().equals(user.getId()))) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own products");
    }

    productRepository.delete(product);
  }
}
