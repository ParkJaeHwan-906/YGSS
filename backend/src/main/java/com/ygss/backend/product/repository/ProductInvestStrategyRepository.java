package com.ygss.backend.product.repository;

import com.ygss.backend.product.dto.ProductInvestStrategyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductInvestStrategyRepository {
    @Select("""
            SELECT pc.category_name, pcp.percentage FROM product_category_percentage pcp
            JOIN product_categories pc ON pcp.category_id = pc.id
            WHERE pcp.super_product_id = #{retirePensionProductId}
            ORDER BY pcp.percentage DESC
            LIMIT 3;
            """)
    List<ProductInvestStrategyDto> selectProductInvestStrategyById(Long retirePensionProductId);
}
