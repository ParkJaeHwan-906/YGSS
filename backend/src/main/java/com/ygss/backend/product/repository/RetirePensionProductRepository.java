package com.ygss.backend.product.repository;

import com.ygss.backend.product.dto.RetirePensionProductDetailResponseDto;
import com.ygss.backend.product.dto.RetirePensionProductResponseDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Mapper
public interface RetirePensionProductRepository {
    /**
     * DC (ETF/펀드) 전체 상품 조회
     */
    @Select("""
            SELECT
            rpp.id AS 'id',
            rpp.product AS 'product',
            c.company AS 'company',
            rppt.product_type AS 'productType',
            rpp.next_year_profit_rate AS 'profitPrediction',
            rpp.risk_grade_id AS 'riskGradeId'
            FROM retire_pension_products rpp
            JOIN retire_pension_product_type rppt ON rpp.product_type_id = rppt.id
            JOIN retire_pension_systype rps ON rps.id = rpp.systype_id
            JOIN companies c ON c.id = rpp.company_id
            ORDER BY rpp.next_year_profit_rate ${sort};
            """)
    List<RetirePensionProductResponseDto> selectAllDcProduct(String sort);
    /**
     * (ETF/펀드) 상세 조회
     */
    @Select("""
            SELECT
            rpp.id AS 'id',
            CASE\s
            	WHEN rps.id > 2 THEN '원금비보장형'
            	ELSE '원금보장형'
            END AS 'productSystypeSummary',
            rps.systype AS 'productSystype',
            rpp.product AS 'product',
            c.company AS 'company',
            rppt.product_type AS 'productType',
            rpp.next_year_profit_rate AS 'profitPrediction',
            rpp.risk_grade_id AS 'riskGradeId',
            prg.grade AS 'riskGrade'
            FROM retire_pension_products rpp
            JOIN retire_pension_product_type rppt ON rpp.product_type_id = rppt.id
            JOIN retire_pension_systype rps ON rps.id = rpp.systype_id
            JOIN product_risk_grade prg ON prg.id = rpp.risk_grade_id
            JOIN companies c ON c.id = rpp.company_id
            WHERE rpp.id = #{retirePensionProductId};
            """)
    Optional<RetirePensionProductDetailResponseDto> selectRetirePensionProductById(Long retirePensionProductId);

}
