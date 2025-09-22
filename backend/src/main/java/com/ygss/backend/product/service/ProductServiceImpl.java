package com.ygss.backend.product.service;

import com.ygss.backend.pensionProduct.dto.response.BondDto;
import com.ygss.backend.pensionProduct.repository.PensionProductRepository;
import com.ygss.backend.product.dto.*;
import com.ygss.backend.product.repository.ProductDetailRepository;
import com.ygss.backend.product.repository.ProductInvestStrategyRepository;
import com.ygss.backend.product.repository.ProductPriceLogRespository;
import com.ygss.backend.product.repository.RetirePensionProductRepository;
import com.ygss.backend.user.repository.UserAccountsRepository;

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
    private final UserAccountsRepository userAccountsRepository;
    private final PensionProductRepository pensionProductRepository;
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
    public RetirePensionProductDetailResponseDto selectRetirePensionProductById(Long retirePensionProductId, String userEmail) {
        boolean exist = pensionProductRepository.getProductLike(retirePensionProductId, userEmail) > 0;

        RetirePensionProductDetailResponseDto result = retirePensionProductRepository.selectRetirePensionProductById(retirePensionProductId)
                .orElseThrow(() -> new IllegalArgumentException("Not Found Retire Pension Product"));
        result.setIsLiked(userEmail == null ? null : exist);
        return result;
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

    /**
     * BOND 전체 리스트 조회
     */
    @Override
    public List<BondProductResponseDto> selectAllBondProduct(ProductListRequestDto request) {
        return retirePensionProductRepository.selectAllBond(request.sortToString());
    }

    @Override
    public BondDto selectBondDetailById(Long bondProductId, String userEmail) {
        boolean exist = pensionProductRepository.getBondLike(bondProductId, userEmail) > 0;

        BondDto result = retirePensionProductRepository.selectBondById(bondProductId).orElseThrow(() -> new IllegalArgumentException("Not Found Bond Product"));
        result.setIsLiked(userEmail == null ? null : exist);
        return result;
    }

    @Override
    public PersonalRecommendProductResopnseDto selectAllProductByPersonal(String userEmail) {
        // 1. 투자 성향이 있는지 조회
        Long riskGradeId = userEmail == null ? 5L : userAccountsRepository.selectRiskGradeIdByUserEmail(userEmail)
                .orElse(5L);

        return new PersonalRecommendProductResopnseDto(retirePensionProductRepository.selectAllProductByPersonal(riskGradeId));
    }
}
