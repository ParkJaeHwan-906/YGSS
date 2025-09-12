package com.ygss.backend.product.repository;

import com.ygss.backend.product.dto.RetirePensionProductResponseDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RetirePensionProductRepository {
    /**
     * DC 전체 상품 조회
     */
    @Select("""
            SELECT
            rpp.id AS 'id',
            rpp.product AS 'product',
            c.company AS 'company',
            rpp.next_year_profit_rate AS 'profitPrediction',
            rpp.risk_grade_id AS 'riskGrade'
            FROM retire_pension_products rpp
            JOIN retire_pension_product_type rppt ON rpp.product_type_id = rppt.id
            JOIN retire_pension_systype rps ON rps.id = rpp.systype_id
            JOIN companies c ON c.id = rpp.company_id
            ORDER BY rpp.next_year_profit_rate ${sort};
            """)
    List<RetirePensionProductResponseDto> selectAllDcProduct(String sort);

}
