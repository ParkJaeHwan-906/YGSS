package com.ygss.backend.product.service;

import com.ygss.backend.product.dto.*;
import com.ygss.backend.product.repository.ProductDetailRepository;
import com.ygss.backend.product.repository.ProductInvestStrategyRepository;
import com.ygss.backend.product.repository.ProductPriceLogRespository;
import com.ygss.backend.product.repository.RetirePensionProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final RetirePensionProductRepository retirePensionProductRepository;
    private final ProductPriceLogRespository productPriceLogRespository;
    private final ProductInvestStrategyRepository productInvestStrategyRepository;
    private final ProductDetailRepository productDetailRepository;
    @Override
    public List<RetirePensionProductResponseDto> selectAllDcProduct(ProductListRequestDto request) {
        return retirePensionProductRepository.selectAllDcProduct(request.sortToString());
    }
    @Override
    public List<RetirePensionProductResponseDto> selectDcEtfProduct(ProductListRequestDto request) {
        return retirePensionProductRepository.selectDcProduct(request.sortToString(), 1L);
    }
    @Override
    public List<RetirePensionProductResponseDto> selectDcPensionProduct(ProductListRequestDto request) {
        return retirePensionProductRepository.selectDcProduct(request.sortToString(), 2L);
    }
    @Override
    public RetirePensionProductDetailResponseDto selectRetirePensionProductById(Long retirePensionProductId) {
        return retirePensionProductRepository.selectRetirePensionProductById(retirePensionProductId)
                .orElseThrow(() -> new IllegalArgumentException("Not Found Retire Pension Product"));
    }

    @Override
    public RetirePensionProductGraphResponseDto selectRetirePensionProductGraphById(Long retirePensionProductId) {
        RetirePensionProductGraphResponseDto retirePensionProductGraphResponseDto = RetirePensionProductGraphResponseDto.builder()
                .priceChart(productPriceLogRespository.selectProductPriceLogById(retirePensionProductId))
                .investStrategy(productInvestStrategyRepository.selectProductInvestStrategyById(retirePensionProductId))
                .doughnutChart(productDetailRepository.selectProductDetailById(retirePensionProductId))
                .build();
        retirePensionProductGraphResponseDto.addEtc();
        return retirePensionProductGraphResponseDto;
    }

    @Override
    public List<ProductPriceLogDto> selectRetirePensionDetailPriceLog(Long retirePensionProductId) {
        return productPriceLogRespository.selectProductPriceLogById(retirePensionProductId);
    }
}
