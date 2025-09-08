package com.ygss.backend.pensionProduct.service;

import com.ygss.backend.pensionProduct.dto.entity.Company;
import com.ygss.backend.pensionProduct.dto.entity.PensionProduct;
import com.ygss.backend.pensionProduct.dto.entity.ProductType;
import com.ygss.backend.pensionProduct.dto.entity.Systype;
import com.ygss.backend.pensionProduct.dto.response.PensionProductDto;
import com.ygss.backend.pensionProduct.dto.request.SearchCondition;
import com.ygss.backend.pensionProduct.dto.response.PageInfo;
import com.ygss.backend.pensionProduct.dto.response.PensionProductSearchResponse;
import com.ygss.backend.pensionProduct.repository.PensionProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 퇴직연금 상품 서비스
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class PensionProductServiceImpl implements PensionProductService {

    private final PensionProductRepository pensionProductRepository;

    /**
     * 동적 조건으로 상품 검색
     */
    @Override
    public PensionProductSearchResponse searchProducts(SearchCondition condition) {
        log.info("상품 검색 요청: {}", condition);

        // 총 개수 조회
        long totalElements = pensionProductRepository.countProducts(condition);

        // 상품 목록 조회
        List<PensionProduct> products = pensionProductRepository.searchProducts(condition);

        // DTO 변환
        List<PensionProductDto> productDtos = products.stream()
                .map(this::convertToDto)
                .toList();

        // 페이지 정보 생성
        PageInfo pageInfo = PageInfo.of(condition.getPage(), condition.getSize(), totalElements);

        log.info("검색 결과: 총 {}개 상품 ({}페이지)", totalElements, condition.getPage());

        return PensionProductSearchResponse.of(productDtos, pageInfo);
    }

    /**
     * 상품 상세 조회
     */
    @Override
    public Optional<PensionProductDto> findById(Long id) {
        return pensionProductRepository.findById(id)
                .map(this::convertToDto);
    }

    /**
     * 운용사 목록 조회
     */
    @Override
    public List<Company> getAllCompanies() {

            return pensionProductRepository.findAllCompanies();
    }

    /**
     * 상품 타입 목록 조회
     */
    @Override
    public List<ProductType> getAllProductTypes() {
        return pensionProductRepository.findAllProductTypes();
    }

    /**
     * 시스템 타입 목록 조회
     */
    @Override
    public List<Systype> getAllSystypes() {
        return pensionProductRepository.findAllSystypes();
    }

    /**
     * Entity를 DTO로 변환
     */
    private PensionProductDto convertToDto(PensionProduct product) {
        return PensionProductDto.builder()
                .id(product.getId())
                .productName(product.getProduct())
                .productType(product.getProductTypeName())
                .companyName(product.getCompanyName())
                .systype(product.getSystypeName())
                .riskGrade(product.getRiskGrade())
                .reserve(product.getReserve())
                .nextYearProfitRate(product.getNextYearProfitRate())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
