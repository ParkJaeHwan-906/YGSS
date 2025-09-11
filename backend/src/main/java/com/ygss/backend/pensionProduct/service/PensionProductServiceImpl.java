package com.ygss.backend.pensionProduct.service;

import com.ygss.backend.global.exception.UserNotFoundException;
import com.ygss.backend.pensionProduct.dto.entity.PensionProduct;
import com.ygss.backend.pensionProduct.dto.request.BondSearchRequest;
import com.ygss.backend.pensionProduct.dto.response.*;
import com.ygss.backend.pensionProduct.dto.request.SearchCondition;
import com.ygss.backend.pensionProduct.repository.PensionProductRepository;
import com.ygss.backend.user.repository.UserAccountsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    private final UserAccountsRepository usersAccountsRepository;
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
    public List<CompanyResponse> getAllCompanies() {

            return pensionProductRepository.findAllCompanies();
    }

    /**
     * 상품 타입 목록 조회
     */
    @Override
    public List<ProductTypeResponse> getAllProductTypes() {
        return pensionProductRepository.findAllProductTypes();
    }

    /**
     * 시스템 타입 목록 조회
     */
    @Override
    public List<SystypeResponse> getAllSystypes() {
        return pensionProductRepository.findAllSystypes();
    }


    @Override
    public BondSearchResponse searchBonds(BondSearchRequest searchRequest) {
//        log.info("채권 목록 조회 - 검색조건: {}", searchRequest);

        // 전체 개수 조회
        long totalElements = pensionProductRepository.countBonds(searchRequest);

        // 페이징 정보 생성
        PageInfo pageInfo = PageInfo.of(searchRequest.getPage(), searchRequest.getSize(), totalElements);

        // 채권 목록 조회
        List<BondDto> bonds = pensionProductRepository.selectBonds(searchRequest);

//        log.info("채권 목록 조회 완료 - 조회 건수: {}, {}", bonds.size(), pageInfo.getSummary());

        return BondSearchResponse.of(bonds, pageInfo);
    }

    @Override
    public Optional<BondDto> searchBondById(Long bondId) {
//        log.info("채권 단건 조회 - ID: {}", bondId);

        Optional<BondDto> result = pensionProductRepository.selectBondById(bondId);

        if (result.isPresent()) {
//            log.info("채권 단건 조회 완료 - {}", result.get().getProductName());
        } else {
//            log.warn("채권 정보 없음 - ID: {}", bondId);
        }

        return result;
    }

    public ProductSummaryResponse getProductSummary(Long productId) {
        // 상품명 조회
        String productName = pensionProductRepository.getProductName(productId);
        if (productName == null) {
            throw new RuntimeException("Product not found with id: " + productId);
        }

        // 상위 4개 카테고리 조회
        List<CategorySummary> top4Summary = pensionProductRepository.getTop4CategorySummary(productId);

        // 나머지 카테고리들의 총 비중 계산
        Double othersPercentage = pensionProductRepository.getOthersCategoryPercentage(productId);

        // 결과 리스트 생성
        List<CategorySummary> result = new ArrayList<>(top4Summary);

        // 나머지 비중이 0보다 크면 "기타" 항목 추가
        if (othersPercentage > 0) {
            result.add(CategorySummary.builder()
                    .categoryName("기타")
                    .percentage(othersPercentage)
                    .build());
        }

        return ProductSummaryResponse.builder()
                .productName(productName)
                .summary(result)
                .id(productId)
                .build();
    }

    @Override
    public List<ProductTimeLineDto> getProductTimeLine(Long productId) {
        return pensionProductRepository.getTimeLines(productId);
    }

    public List<ProductDetailResponse> getProductDetails(Long productId) {
        return pensionProductRepository.getProductDetails(productId);
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

    @Transactional
    @Override
    public boolean toggleProductLike(Long productId,String email){
        Long userId = usersAccountsRepository.selectUserIdByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + email));
        boolean exist = pensionProductRepository.getProductLike(userId, productId) != 0;

        if (exist) {
            pensionProductRepository.deleteProductLike(userId, productId);
            return false;
        }
        pensionProductRepository.addProductLike(userId, productId);
        return true;
    }
    @Transactional
    @Override
    public boolean toggleBondLike(Long BondId,String email) {
        Long userId = usersAccountsRepository.selectUserIdByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + email));
        boolean exist = pensionProductRepository.getProductLike(userId, BondId) != 0;

        if (exist) {
            pensionProductRepository.deleteBondLike(userId, BondId);
            return false;
        }
        pensionProductRepository.addBondLike(userId, BondId);
        return true;
    }
}
