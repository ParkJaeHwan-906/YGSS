package com.ygss.backend.product.service;

import com.ygss.backend.product.dto.ProductListRequestDto;
import com.ygss.backend.product.dto.ProductListRequestDto;
import com.ygss.backend.product.dto.RetirePensionProductResponseDto;

import java.util.List;

public interface ProductService {
    List<RetirePensionProductResponseDto> selectAllDcProduct(ProductListRequestDto request);
}
