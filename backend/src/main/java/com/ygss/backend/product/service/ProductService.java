package com.ygss.backend.product.service;

import com.ygss.backend.product.dto.*;
import com.ygss.backend.product.dto.ProductListRequestDto;

import java.util.List;

public interface ProductService {
    /**
     * ETF/펀드
     */
    List<RetirePensionProductResponseDto> selectAllDcProduct(ProductListRequestDto request);

    /**
     * ETF
     */
    List<RetirePensionProductResponseDto> selectDcEtfProduct(ProductListRequestDto request);

    /**
     * 펀드
     */
    List<RetirePensionProductResponseDto> selectDcPensionProduct(ProductListRequestDto request);

    /**
     * ETF/펀드 상세 조회
     */
    RetirePensionProductDetailResponseDto selectRetirePensionProductById(Long retirePensionProductId);

    /**
     * ETF/펀드 상세 조회 (그래프)
     */
    RetirePensionProductGraphResponseDto selectRetirePensionProductGraphById(Long retirePensionProductId);
}
