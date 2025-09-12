package com.ygss.backend.product.service;

import com.ygss.backend.product.dto.*;
import com.ygss.backend.product.dto.ProductListRequestDto;

import java.util.List;

public interface ProductService {
    List<RetirePensionProductResponseDto> selectAllDcProduct(ProductListRequestDto request);
    RetirePensionProductDetailResponseDto selectRetirePensionProductById(Long retirePensionProductId);
    RetirePensionProductGraphResponseDto selectRetirePensionProductGraphById(Long retirePensionProductId);
}
