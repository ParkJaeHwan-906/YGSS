package com.ygss.backend.product.repository;

import com.ygss.backend.product.dto.ProductPriceLogDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductPriceLogRespository {
    @Select("""
            SELECT `date`, init_price, final_price, daily_rate FROM retire_pension_product_price_log
            WHERE retire_pension_product_id = ${retirePensionProductId};
            """)
    List<ProductPriceLogDto> selectProductPriceLogById(Long retirePensionProductId);
}
