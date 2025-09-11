package com.ygss.backend.pensionProduct.dto.response;

import com.ygss.backend.pensionProduct.dto.entity.PensionProduct;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AllLikedProductDto {
    List<PensionProduct> likedProduct;
    List<BondDto> likedBond;
}
