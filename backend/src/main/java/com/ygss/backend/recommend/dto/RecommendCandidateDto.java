package com.ygss.backend.recommend.dto;

import com.ygss.backend.pensionProduct.dto.entity.PensionProduct;
import com.ygss.backend.pensionProduct.dto.response.BondDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RecommendCandidateDto {
    List<PensionProduct> products;
    List<BondDto> bonds;
}
