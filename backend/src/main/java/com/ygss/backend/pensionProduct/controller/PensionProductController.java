package com.ygss.backend.pensionProduct.controller;

import com.ygss.backend.pensionProduct.dto.entity.Company;
import com.ygss.backend.pensionProduct.dto.entity.ProductType;
import com.ygss.backend.pensionProduct.dto.entity.Systype;
import com.ygss.backend.pensionProduct.dto.request.BondSearchRequest;
import com.ygss.backend.pensionProduct.dto.request.PensionProductSearchRequest;
import com.ygss.backend.pensionProduct.dto.request.SearchCondition;
import com.ygss.backend.pensionProduct.dto.response.*;
import com.ygss.backend.pensionProduct.service.PensionProductService;
import com.ygss.backend.pensionProduct.service.PensionProductServiceImpl;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

/**
 * 퇴직연금 상품 REST API Controller
 */
@RestController
@RequestMapping("/pension")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "퇴직연금 포트폴리오 API", description = "ETF/펀드/채권 상품 검색 및 조회 API")
public class PensionProductController {

    private final PensionProductServiceImpl pensionProductService;

    /**
     * 상품 검색
     */
    @Operation(
            summary = "상품 검색",
            description = "다양한 조건으로 ETF/펀드 상품을 검색합니다. 모든 파라미터는 선택사항입니다."
    )
    @GetMapping("/product/search")
    public ResponseEntity<PensionProductSearchResponse> searchProducts(
            @ModelAttribute PensionProductSearchRequest request) {
        try{
            // 요청 검증
            request.validate();
            log.debug(request.toString());
            // SearchCondition으로 변환
            SearchCondition condition = request.toSearchCondition();

            // 검색 실행
            PensionProductSearchResponse response = pensionProductService.searchProducts(condition);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * 운용사 목록 조회
     */
    @Operation(summary = "운용사 목록 조회", description = "등록된 모든 운용사 목록을 조회합니다")
    @ApiResponse(
            responseCode = "200",
            description = "조회 성공",
            content = @Content(schema = @Schema(implementation = CompanyResponse.class))
    )
    @GetMapping("/product/companies")
    public ResponseEntity<?> getAllCompanies() {

//        log.info("운용사 목록 조회 요청");
        try{
            List<CompanyResponse> companies = pensionProductService.getAllCompanies();

            return ResponseEntity.ok(companies);
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    /**
     * 상품 타입 목록 조회
     */
    @Operation(summary = "상품 타입 목록 조회", description = "지원하는 상품 타입 목록(ETF, 펀드)을 조회합니다")
    @ApiResponse(
            responseCode = "200",
            description = "조회 성공",
            content = @Content(schema = @Schema(implementation = ProductTypeResponse.class))
    )
    @GetMapping("/product/types")
    public ResponseEntity<List<ProductTypeResponse>> getAllProductTypes() {

        List<ProductTypeResponse> productTypes = pensionProductService.getAllProductTypes();

        return ResponseEntity.ok(productTypes);
    }

    /**
     * 시스템 타입 목록 조회
     */
    @Operation(summary = "시스템 타입 목록 조회", description = "시스템 타입 목록(원금보장/비보장)을 조회합니다")
    @ApiResponse(
            responseCode = "200",
            description = "조회 성공",
            content = @Content(schema = @Schema(implementation = SystypeResponse.class))
    )
    @GetMapping("/systypes")
    public ResponseEntity<List<SystypeResponse>> getAllSystypes() {

        List<SystypeResponse> systypes = pensionProductService.getAllSystypes();

        return ResponseEntity.ok(systypes);
    }

    @Operation(summary = "채권 목록 조회", description = "검색 조건에 따라 채권 목록을 페이징하여 조회합니다.")
    @GetMapping("/bond")
    public ResponseEntity<BondSearchResponse> searchBonds(
            @ModelAttribute BondSearchRequest request) {
        try {
            BondSearchResponse result = pensionProductService.searchBonds(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @Operation(summary = "채권 단건 조회", description = "채권 ID로 채권 하나를 조회합니다.")
    @GetMapping("/bond/{id}")
    public ResponseEntity<BondDto> searchBondById(
            @Parameter(description = "채권 ID", example = "1", required = true)
            @PathVariable Long id) {

        try {
            Optional<BondDto> result = pensionProductService.searchBondById(id);

            return result.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "상품 단건 요약 제공", description = "상품의 요약 정보를 제공합니다.")
    @GetMapping("/product/{id}")
    public ResponseEntity<ProductSummaryResponse> getProductSummary(@PathVariable Long id) {
        try {
            ProductSummaryResponse summary = pensionProductService.getProductSummary(id);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "상품 단건 상세 정보 제공", description = "상품의 상세 정보를 제공합니다.")
    @GetMapping("/product/{id}/detail")
    public ResponseEntity<List<ProductDetailResponse>> getProductDetails(@PathVariable Long id) {
        try {
            List<ProductDetailResponse> details = pensionProductService.getProductDetails(id);
            return ResponseEntity.ok(details);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "상품 단건 시계열 정보 제공", description = "상품의 시계열 정보를 제공합니다.")
    @GetMapping("/product/time-line/{id}")
    public ResponseEntity<List<ProductTimeLineDto>> getProductTimeLines(@PathVariable Long id){
        try {
            List<ProductTimeLineDto> timeLines = pensionProductService.getProductTimeLine(id);
            return ResponseEntity.ok(timeLines);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/product/{productId}/like") //
    public boolean toggleProductLike(@PathVariable Long productId, Principal principal) {
        return pensionProductService.toggleProductLike(productId,principal.getName());
    }

    @PostMapping("/bond/{BondId}/like") //
    public boolean toggleBondLike(@PathVariable Long BondId, Principal principal) {
        return pensionProductService.toggleBondLike(BondId,principal.getName());
    }

    @GetMapping("/liked-product")
    public ResponseEntity<?> getAllLikedProduct(Principal principal){
        try {
            return ResponseEntity.ok(pensionProductService.getAllLikedProduct(principal.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
