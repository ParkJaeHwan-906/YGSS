package com.ygss.backend.product.service;

import com.ygss.backend.pensionProduct.dto.response.BondDto;
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

    /**
     * ETF/펀드 시계열 데이터 조회
     */
    public List<ProductPriceLogDto> selectRetirePensionDetailPriceLog(Long retirePensionProductId);

    /**
     * BOND
     */
    List<BondProductResponseDto> selectAllBondProduct(ProductListRequestDto request);
    BondDto selectBondDetailById(Long bondProductId);
}
