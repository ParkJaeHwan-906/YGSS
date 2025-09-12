package com.ygss.backend.product.repository;

import com.ygss.backend.product.dto.ProductDetailDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductDetailRepository {
    @Select("""
            SELECT rppd.product, rppd.weight AS 'percentage' FROM retire_pension_product_details rppd
            JOIN retire_pension_products rpp ON rpp.id = rppd.super_product_id
            WHERE rppd.super_product_id = #{retirePensionProductId}
            ORDER BY rppd.weight DESC
            LIMIT 5;
            """)
    List<ProductDetailDto> selectProductDetailById(Long retirePensionProductId);
}
