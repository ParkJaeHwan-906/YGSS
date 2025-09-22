package com.ygss.backend.product.repository;

import com.ygss.backend.pensionProduct.dto.response.BondDto;
import com.ygss.backend.product.dto.BondProductResponseDto;
import com.ygss.backend.product.dto.RetirePensionProductDetailResponseDto;
import com.ygss.backend.product.dto.RetirePensionProductResponseDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
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
            WHERE rpp.product_type_id = #{productTypeId}
            ORDER BY rpp.next_year_profit_rate ${sort};
            """)
    List<RetirePensionProductResponseDto> selectDcProduct(String sort, Long productTypeId);
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

    /**
     * BOND 전체 상품 조회
     */
    @Select({
            "SELECT",
            "    b.id AS id,",
            "    b.product AS productName,",
            "    b.publisher_grade AS publisherGrade,",
            "    b.publisher,",
            "    b.coupon_rate AS couponRate,",
            "    b.maturity_years AS maturityYears",
            "FROM bond_products b",
            "ORDER by b.coupon_rate ${sort}"
    })
    List<BondProductResponseDto> selectAllBond(String sort);

    /**
     * BOND 단건 조회
     */
    @Select({
            "SELECT",
            "    b.id AS id,",
            "    b.product AS productName,",
            "    b.risk_grade_id AS riskGrade,",
            "    b.publisher_grade AS publisherGrade,",
            "    b.publisher,",
            "    b.coupon_rate AS couponRate,",
            "    b.published_rate AS publishedRate,",
            "    b.evalution_rate AS evaluationRate,",
            "    b.maturity_years AS maturityYears,",
            "    b.expired_day AS expiredDay,",
            "    b.final_profit_rate AS finalProfitRate",
            "FROM bond_products b",
            "WHERE b.id = #{bondId}"
    })
    Optional<BondDto> selectBondById(@Param("bondId") Long bondId);

    /**
     * 개인형 추천 상품 조회
     * 채권 + ETF + 펀드
     * 개인 투자 성향 반영
     */
    @Select("""
            SELECT
            rpp.id,
            rpp.product,
            CASE
            WHEN rpp.product_type_id=1 THEN 'ETF'
            WHEN rpp.product_type_id=2 THEN '펀드'
            END AS 'productType',
            rpp.risk_grade_id,
            c.company,
            rpp.next_year_profit_rate AS 'profitPrediction'
            FROM retire_pension_products rpp
            JOIN companies c ON c.id = rpp.company_id
            WHERE rpp.risk_grade_id <= #{riskGradeId}
            UNION
            SELECT
            bp.id,
            bp.product,
            CASE
            WHEN bp.product_type_id=3 THEN 'BOND'
            END AS 'productType',
            bp.risk_grade_id,
            bp.publisher AS 'company',
            bp.final_profit_rate AS 'profitPrediction'
            FROM bond_products bp
            WHERE bp.risk_grade_id <= #{riskGradeId};
            """)
    List<RetirePensionProductResponseDto> selectAllProductByPersonal(Long riskGradeId);
}
