package com.ygss.backend.pensionProduct.service;

import com.ygss.backend.pensionProduct.dto.entity.Company;
import com.ygss.backend.pensionProduct.dto.entity.ProductType;
import com.ygss.backend.pensionProduct.dto.entity.Systype;
import com.ygss.backend.pensionProduct.dto.request.BondSearchRequest;
import com.ygss.backend.pensionProduct.dto.request.SearchCondition;
import com.ygss.backend.pensionProduct.dto.response.*;

import java.util.List;
import java.util.Optional;

public interface PensionProductService {
    PensionProductSearchResponse searchProducts(SearchCondition condition);

    Optional<PensionProductDto> findById(Long id);

    List<CompanyResponse> getAllCompanies();

    List<ProductTypeResponse> getAllProductTypes();

    List<SystypeResponse> getAllSystypes();

    BondSearchResponse searchBonds(BondSearchRequest searchRequest);

    Optional<BondDto> searchBondById(Long bondId);
    List<ProductDetailResponse> getProductDetails(Long productId);
    ProductSummaryResponse getProductSummary(Long productId);
    List<ProductTimeLineDto> getProductTimeLine(Long productId);
    boolean toggleProductLike(Long productId,String email);
    boolean toggleBondLike(Long productId,String email);

    AllLikedProductDto getAllLikedProduct(String name);
}
