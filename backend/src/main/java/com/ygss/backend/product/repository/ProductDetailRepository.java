package com.ygss.backend.product.repository;

import com.ygss.backend.product.dto.ProductDetailDto;
import com.ygss.backend.recommend.dto.ProductRequestDto;
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

    @Select("""
            SELECT
            rpp.id AS 'id',
            CASE
            	WHEN rpp.product_type_id = 1 THEN 'etf'
            	WHEN rpp.product_type_id = 2 THEN 'fund'
            END AS 'asset_type',
            rpp.risk_grade_id AS 'risk_grade_id',
            rpp.reserve AS 'reserve',
            rpp.next_year_profit_rate AS 'predicted_return'
            FROM retire_pension_products rpp
            WHERE rpp.risk_grade_id <= #{riskGradeId}
            """)
    List<ProductRequestDto> selectProductForRecommend(Long riskGradeId);
}
