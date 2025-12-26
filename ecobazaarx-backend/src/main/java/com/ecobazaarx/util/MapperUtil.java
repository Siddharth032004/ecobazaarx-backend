package com.ecobazaarx.util;

import com.ecobazaarx.dto.CartDto;
import com.ecobazaarx.dto.CartItemDto;
import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.entity.Cart;
import com.ecobazaarx.entity.CartItem;
import com.ecobazaarx.entity.Product;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

public class MapperUtil {

    public static ProductDto toProductDto(Product p) {
        if (p == null)
            return null;
        ProductDto d = new ProductDto();
        d.setId(p.getId());
        d.setName(p.getName());
        d.setCategoryName(p.getCategoryName());
        d.setBrand(p.getBrand());
        d.setPrice(p.getPrice());
        d.setStockQuantity(p.getStockQuantity());
        d.setImageUrl(p.getImageUrl());
        d.setCarbonFootprintPerUnit(p.getCarbonFootprintPerUnit());
        d.setCarbonSavedPerItem(p.getCarbonSavedPerItem());
        d.setSellerStoreName(p.getSellerStoreName());
        d.setSlug(p.getSlug());
        d.setMrp(p.getMrp());
        d.setRating(p.getRating());
        d.setDiscountPercent(p.getDiscountPercent());
        d.setIsFeatured(p.getIsFeatured());
        d.setImages(p.getImages());
        d.setCity(p.getCity());
        d.setState(p.getState());
        return d;
    }

    public static Product fromProductDto(ProductDto d) {
        if (d == null)
            return null;
        Product p = Product.builder()
                .id(d.getId())
                .name(d.getName())
                .categoryName(d.getCategoryName())
                .brand(d.getBrand())
                .price(d.getPrice())
                .stockQuantity(d.getStockQuantity())
                .imageUrl(d.getImageUrl())
                .carbonFootprintPerUnit(d.getCarbonFootprintPerUnit())
                // carbonSavedPerItem is calculated, not mapped from DTO input usually, but we
                // can map it if needed.
                // Logic in ProductService handles calculation on create/update.
                .carbonSavedPerItem(d.getCarbonSavedPerItem())
                .sellerStoreName(d.getSellerStoreName())
                .slug(d.getSlug())
                .mrp(d.getMrp())
                .rating(d.getRating())
                .discountPercent(d.getDiscountPercent())
                .isFeatured(d.getIsFeatured())
                .images(d.getImages())
                .city(d.getCity())
                .state(d.getState())
                .build();
        return p;
    }

    public static CartItemDto toCartItemDto(CartItem i) {
        if (i == null)
            return null;
        CartItemDto d = new CartItemDto();
        d.setId(i.getId());
        d.setProductId(i.getProductId());
        d.setProductName(i.getProductName());
        d.setProductPrice(i.getProductPrice());
        d.setQuantity(i.getQuantity());
        d.setCarbonFootprintPerUnit(i.getCarbonFootprintPerUnit());
        d.setCarbonSavedPerItem(i.getCarbonSavedPerItem());
        d.setImageUrl(i.getImageUrl());

        // Round to 2 decimal places to avoid floating point precision issues
        double subtotal = i.getProductPrice() * i.getQuantity();
        d.setSubtotal(BigDecimal.valueOf(subtotal)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue());

        double carbonSubtotal = i.getCarbonFootprintPerUnit() * i.getQuantity();
        d.setSubtotalCarbonFootprint(BigDecimal.valueOf(carbonSubtotal)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue());

        double savedSubtotal = (i.getCarbonSavedPerItem() != null ? i.getCarbonSavedPerItem() : 0.0) * i.getQuantity();
        d.setSubtotalCarbonSaved(BigDecimal.valueOf(savedSubtotal)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue());

        return d;
    }

    public static CartDto toCartDto(Cart c) {
        if (c == null)
            return null;
        CartDto dto = new CartDto();
        dto.setId(c.getId());
        dto.setUserId(c.getUserId());
        List<CartItemDto> items = c.getItems().stream().map(MapperUtil::toCartItemDto).collect(Collectors.toList());
        dto.setItems(items);
        dto.setSubtotal(c.getSubtotal());
        dto.setSubtotalCarbonFootprint(c.getSubtotalCarbonFootprint());
        return dto;
    }
}
