package com.ygss.backend.pensionProduct.service;

import com.ygss.backend.global.exception.UserNotFoundException;
import com.ygss.backend.pensionProduct.dto.entity.PensionProduct;
import com.ygss.backend.pensionProduct.dto.request.BondSearchRequest;
import com.ygss.backend.pensionProduct.dto.request.UpdateProfitRequest;
import com.ygss.backend.pensionProduct.dto.response.*;
import com.ygss.backend.pensionProduct.dto.request.SearchCondition;
import com.ygss.backend.pensionProduct.repository.PensionProductRepository;
import com.ygss.backend.user.repository.UserAccountsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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
//        log.info("상품 검색 요청: {}", condition);

        // 총 개수 조회
        long totalElements = pensionProductRepository.countProducts(condition);

        // 상품 목록 조회
        List<PensionProduct> products = pensionProductRepository.selectSearch(condition);

        // DTO 변환
        List<PensionProductDto> productDtos = products.stream()
                .map(this::convertToDto)
                .toList();

        // 페이지 정보 생성
        PageInfo pageInfo = PageInfo.of(condition.getPage(), condition.getSize(), totalElements);

//        log.info("검색 결과: 총 {}개 상품 ({}페이지)", totalElements, condition.getPage());

        return PensionProductSearchResponse.of(productDtos, pageInfo);
    }

    /**
     * 상품 상세 조회
     */
    @Override
    public Optional<PensionProductDto> findById(Long productId) {
        return pensionProductRepository.findById(productId)
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
    public BondDto searchBondById(Long bondProductId, String userEmail) {
        boolean exist = pensionProductRepository.getBondLike(bondProductId, userEmail) > 0;

        BondDto result = pensionProductRepository.selectBondById(bondProductId)
                .orElseThrow(() -> new RuntimeException("Not Found User : " + userEmail));
        result.setIsLiked(userEmail == null ? null : exist);
        return result;
    }

    public ProductSummaryResponse getProductSummary(Long productId) {
        // 상품명 조회
        PensionProductDto product = findById(productId).orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다: " ));
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
                .product(product)
                .summary(result)
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
                .build();
    }

    @Transactional
    @Override
    public boolean toggleProductLike(Long productId,String email){
        Long userId = usersAccountsRepository.selectUserIdByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + email));
        boolean exist = pensionProductRepository.getProductLike(productId, email) != 0;

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
        boolean exist = pensionProductRepository.getBondLike(BondId, email) != 0;

        if (exist) {
            pensionProductRepository.deleteBondLike(userId, BondId);
            return false;
        }
        pensionProductRepository.addBondLike(userId, BondId);
        return true;
    }

    @Override
    public AllLikedProductDto getAllLikedProduct(String email) {
        Long userId = usersAccountsRepository.selectUserIdByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + email));
        List<BondDto> bonds = pensionProductRepository.selectLikedBonds(userId);
        List<PensionProduct> products = pensionProductRepository.selectLikedProducts(userId);

        return AllLikedProductDto.builder().likedProduct(products).likedBond(bonds).build();
    }

    @Override
    public List<BestLikedProductDto> getBest9LikedProducts() {
        return pensionProductRepository.selectBest9LikedProducts();
    }

    @Override
    @Transactional(
            isolation = Isolation.READ_COMMITTED,  // 격리 수준
            propagation = Propagation.REQUIRED,    // 전파 방식
            readOnly = false                       // 읽기 전용 여부
    )
    public Boolean updateProfit(List<UpdateProfitRequest> items) {
        // 바로 업데이트 - affected rows로 검증
        int updatedCount = pensionProductRepository.batchUpdateProfit(items);

        // 업데이트된 행 수로 검증
        if (updatedCount != items.size()) {
            throw new RuntimeException("Invalid ID found");
        }

        return true;
    }
}
