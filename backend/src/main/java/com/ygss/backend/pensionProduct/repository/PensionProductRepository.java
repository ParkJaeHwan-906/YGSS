package com.ygss.backend.pensionProduct.repository;

import com.ygss.backend.pensionProduct.dto.entity.PensionProduct;
import com.ygss.backend.pensionProduct.dto.request.BondSearchRequest;
import com.ygss.backend.pensionProduct.dto.request.SearchCondition;
import com.ygss.backend.pensionProduct.dto.request.UpdateProfitRequest;
import com.ygss.backend.pensionProduct.dto.response.*;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 퇴직연금 상품 MyBatis Repository
 */
@Mapper
@Repository
public interface PensionProductRepository {

    /**
     * 동적 조건으로 상품 검색 (페이징)
     */
    @Select({
            "<script>",
            "SELECT ",
            "    rpp.id,",
            "    rpp.company_id,",
            "    rpp.systype_id,",
            "    rpp.product_type_id,",
            "    rpp.product,",
            "    rpp.risk_grade_id,",
            "    rpp.reserve,",
            "    rpp.next_year_profit_rate,",
            "    rpp.created_at,",
            "    rpp.updated_at,",
            "    c.company AS company_name,",
            "    pt.product_type AS product_type_name,",
            "    s.systype AS systype_name",
            "FROM retire_pension_products rpp",
            "INNER JOIN companies c ON rpp.company_id = c.id",
            "INNER JOIN retire_pension_product_type pt ON rpp.product_type_id = pt.id",
            "INNER JOIN retire_pension_systype s ON rpp.systype_id = s.id",
            "<where>",
            "    pt.product_type IN ('ETF', '펀드')",
            "    <if test='productTypes != null and productTypes.size() > 0'>",
            "        AND pt.product_type IN",
            "        <foreach collection='productTypes' item='type' open='(' close=')' separator=','>",
            "            #{type}",
            "        </foreach>",
            "    </if>",
            "    <if test='companyIds != null and companyIds.size() > 0'>",
            "        AND c.id IN",
            "        <foreach collection='companyIds' item='companyId' open='(' close=')' separator=','>",
            "            #{companyId}",
            "        </foreach>",
            "    </if>",
            "    <if test='riskGradeFrom != null'>",
            "        AND rpp.risk_grade_id >= #{riskGradeFrom}",
            "    </if>",
            "    <if test='riskGradeTo != null'>",
            "        AND rpp.risk_grade_id &lt;= #{riskGradeTo}",
            "    </if>",
            "    <if test='systypeIds != null and systypeIds.size() > 0'>",
            "        AND s.id IN",
            "        <foreach collection='systypeIds' item='systypeId' open='(' close=')' separator=','>",
            "            #{systypeId}",
            "        </foreach>",
            "    </if>",
            "</where>",
            "ORDER BY rpp.created_at DESC",
            "LIMIT #{limit} OFFSET #{offset}",
            "</script>"
    })
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "companyId", column = "company_id"),
            @Result(property = "systypeId", column = "systype_id"),
            @Result(property = "productTypeId", column = "product_type_id"),
            @Result(property = "product", column = "product"),
            @Result(property = "riskGrade", column = "risk_grade_id"),
            @Result(property = "reserve", column = "reserve"),
            @Result(property = "nextYearProfitRate", column = "next_year_profit_rate"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at"),
            @Result(property = "companyName", column = "company_name"),
            @Result(property = "productTypeName", column = "product_type_name"),
            @Result(property = "systypeName", column = "systype_name")
    })
    List<PensionProduct> selectSearch(SearchCondition condition);

    /**
     * 동적 조건으로 상품 검색 총 개수
     */
    @Select({
            "<script>",
            "SELECT COUNT(*)",  // 이것만!
            "FROM retire_pension_products rpp",
            "INNER JOIN companies c ON rpp.company_id = c.id",
            "INNER JOIN retire_pension_product_type pt ON rpp.product_type_id = pt.id",
            "INNER JOIN retire_pension_systype s ON rpp.systype_id = s.id",
            "<where>",
            "    pt.product_type IN ('ETF', '펀드')",
            "    <if test='productTypes != null and productTypes.size() > 0'>",
            "        AND pt.product_type IN",
            "        <foreach collection='productTypes' item='type' open='(' close=')' separator=','>",
            "            #{type}",
            "        </foreach>",
            "    </if>",
            "    <if test='companyIds != null and companyIds.size() > 0'>",
            "        AND c.id IN",
            "        <foreach collection='companyIds' item='companyId' open='(' close=')' separator=','>",
            "            #{companyId}",
            "        </foreach>",
            "    </if>",
            "    <if test='riskGradeFrom != null'>",
            "        AND rpp.risk_grade_id >= #{riskGradeFrom}",
            "    </if>",
            "    <if test='riskGradeTo != null'>",
            "        AND rpp.risk_grade_id &lt;= #{riskGradeTo}",
            "    </if>",
            "    <if test='systypeIds != null and systypeIds.size() > 0'>",
            "        AND s.id IN",
            "        <foreach collection='systypeIds' item='systypeId' open='(' close=')' separator=','>",
            "            #{systypeId}",
            "        </foreach>",
            "    </if>",
            "</where>",
            // ORDER BY와 LIMIT 제거!
            "</script>"
    })
    long countProducts(SearchCondition condition);

    /**
     * 운용사 목록 조회
     */
    @Select("SELECT id, area_id, company, created_at, updated_at FROM companies ORDER BY company")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "areaId", column = "area_id"),
            @Result(property = "company", column = "company")
    })
    List<CompanyResponse> findAllCompanies();

    /**
     * 상품 타입 목록 조회
     */
    @Select({
            "SELECT id, product_type, created_at, updated_at ",
            "FROM retire_pension_product_type ",
            "ORDER BY product_type"
    })
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "productType", column = "product_type")
    })
    List<ProductTypeResponse> findAllProductTypes();

    /**
     * 시스템 타입 목록 조회
     */
    @Select("SELECT id, systype FROM retire_pension_systype ORDER BY id")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "systype", column = "systype")
    })
    List<SystypeResponse> findAllSystypes();

    /**
     * 상품 ID로 상세 조회
     */
    @Select({
            "SELECT ",
            "    rpp.id,",
            "    rpp.company_id,",
            "    rpp.systype_id,",
            "    rpp.product_type_id,",
            "    rpp.product,",
            "    rpp.risk_grade_id,",
            "    rpp.reserve,",
            "    rpp.next_year_profit_rate,",
            "    rpp.created_at,",
            "    rpp.updated_at,",
            "    c.company AS company_name,",
            "    pt.product_type AS product_type_name,",
            "    s.systype AS systype_name",
            "FROM retire_pension_products rpp",
            "INNER JOIN companies c ON rpp.company_id = c.id",
            "INNER JOIN retire_pension_product_type pt ON rpp.product_type_id = pt.id",
            "INNER JOIN retire_pension_systype s ON rpp.systype_id = s.id",
            "WHERE rpp.id = #{id}"
    })
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "companyId", column = "company_id"),
            @Result(property = "systypeId", column = "systype_id"),
            @Result(property = "productTypeId", column = "product_type_id"),
            @Result(property = "product", column = "product"),
            @Result(property = "riskGrade", column = "risk_grade_id"),
            @Result(property = "reserve", column = "reserve"),
            @Result(property = "nextYearProfitRate", column = "next_year_profit_rate"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at"),
            @Result(property = "companyName", column = "company_name"),
            @Result(property = "productTypeName", column = "product_type_name"),
            @Result(property = "systypeName", column = "systype_name")
    })
    Optional<PensionProduct> findById(@Param("id") Long id);


    @Select({
            "<script>",
            "SELECT",
            "    b.id AS id,",
            "    b.product AS productName,",
            "    b.risk_grade_id AS riskGrade,",
//            "    prg.grade AS riskGrade,",
            "    b.publisher_grade AS publisherGrade,",
            "    b.publisher,",
            "    b.coupon_rate AS couponRate,",
            "    b.published_rate AS publishedRate,",
            "    b.evalution_rate AS evaluationRate,",
            "    b.maturity_years AS maturityYears,",
            "    b.expired_day AS expiredDay,",
            "    b.final_profit_rate AS finalProfitRate",
            "FROM bond_products b",
//            "INNER JOIN product_risk_grade prg ON b.risk_grade_id = prg.id",
            "<where>",
            "    <if test='minMaturityYears != null'>",
            "        AND b.maturity_years &gt;= #{minMaturityYears}",
            "    </if>",
            "    <if test='maxMaturityYears != null'>",
            "        AND b.maturity_years &lt;= #{maxMaturityYears}",
            "    </if>",
            "    <if test='minRiskGrade != null'>",
            "        AND b.risk_grade_id &lt;= #{minRiskGrade}",
            "    </if>",
            "    <if test='minPublisherGrade != null and minPublisherGrade != \"\"'>",
            "        AND CASE ",
            "            WHEN b.publisher_grade = 'BBB-' THEN 1",
            "            WHEN b.publisher_grade = 'BBB' THEN 2",
            "            WHEN b.publisher_grade = 'BBB+' THEN 3",
            "            WHEN b.publisher_grade = 'A-' THEN 4",
            "            WHEN b.publisher_grade = 'A' THEN 5",
            "            WHEN b.publisher_grade = 'A+' THEN 6",
            "            WHEN b.publisher_grade = 'AA-' THEN 7",
            "            WHEN b.publisher_grade = 'AA' THEN 8",
            "            WHEN b.publisher_grade = 'AA+' THEN 9",
            "            WHEN b.publisher_grade = 'AAA' THEN 10",
            "            ELSE 0",
            "        END >= CASE",
            "            WHEN #{minPublisherGrade} = 'BBB-' THEN 1",
            "            WHEN #{minPublisherGrade} = 'BBB' THEN 2",
            "            WHEN #{minPublisherGrade} = 'BBB+' THEN 3",
            "            WHEN #{minPublisherGrade} = 'A-' THEN 4",
            "            WHEN #{minPublisherGrade} = 'A' THEN 5",
            "            WHEN #{minPublisherGrade} = 'A+' THEN 6",
            "            WHEN #{minPublisherGrade} = 'AA-' THEN 7",
            "            WHEN #{minPublisherGrade} = 'AA' THEN 8",
            "            WHEN #{minPublisherGrade} = 'AA+' THEN 9",
            "            WHEN #{minPublisherGrade} = 'AAA' THEN 10",
            "            ELSE 0",
            "        END",
            "    </if>",
            "</where>",
            "ORDER BY b.final_profit_rate DESC, b.maturity_years ASC",
            "LIMIT #{size} OFFSET #{offset}",
            "</script>"
    })
    List<BondDto> selectBonds(BondSearchRequest searchRequest);

    @Select({
            "<script>",
            "SELECT COUNT(*)",
            "FROM bond_products b",
            "INNER JOIN product_risk_grade prg ON b.risk_grade_id = prg.id",
            "<where>",
            "    <if test='minMaturityYears != null'>",
            "        AND b.maturity_years &gt;= #{minMaturityYears}",
            "    </if>",
            "    <if test='maxMaturityYears != null'>",
            "        AND b.maturity_years &lt;= #{maxMaturityYears}",
            "    </if>",
            "    <if test='minRiskGrade != null'>",
            "        AND b.risk_grade_id &lt;= #{minRiskGrade}",
            "    </if>",
            "    <if test='minPublisherGrade != null and minPublisherGrade != \"\"'>",
            "        AND CASE ",
            "            WHEN b.publisher_grade = 'BBB-' THEN 1",
            "            WHEN b.publisher_grade = 'BBB' THEN 2",
            "            WHEN b.publisher_grade = 'BBB+' THEN 3",
            "            WHEN b.publisher_grade = 'A-' THEN 4",
            "            WHEN b.publisher_grade = 'A' THEN 5",
            "            WHEN b.publisher_grade = 'A+' THEN 6",
            "            WHEN b.publisher_grade = 'AA-' THEN 7",
            "            WHEN b.publisher_grade = 'AA' THEN 8",
            "            WHEN b.publisher_grade = 'AA+' THEN 9",
            "            WHEN b.publisher_grade = 'AAA' THEN 10",
            "            ELSE 0",
            "        END &gt;= CASE",
            "            WHEN #{minPublisherGrade} = 'BBB-' THEN 1",
            "            WHEN #{minPublisherGrade} = 'BBB' THEN 2",
            "            WHEN #{minPublisherGrade} = 'BBB+' THEN 3",
            "            WHEN #{minPublisherGrade} = 'A-' THEN 4",
            "            WHEN #{minPublisherGrade} = 'A' THEN 5",
            "            WHEN #{minPublisherGrade} = 'A+' THEN 6",
            "            WHEN #{minPublisherGrade} = 'AA-' THEN 7",
            "            WHEN #{minPublisherGrade} = 'AA' THEN 8",
            "            WHEN #{minPublisherGrade} = 'AA+' THEN 9",
            "            WHEN #{minPublisherGrade} = 'AAA' THEN 10",
            "            ELSE 0",
            "        END",
            "    </if>",
            "</where>",
            "</script>"
    })
    long countBonds(BondSearchRequest searchRequest);

    @Select({
            "SELECT",
            "    b.id AS id,",
            "    b.product AS productName,",
            "    b.risk_grade_id AS riskGrade,",
//            "    prg.grade AS riskGrade,",
            "    b.publisher_grade AS publisherGrade,",
            "    b.publisher,",
            "    b.coupon_rate AS couponRate,",
            "    b.published_rate AS publishedRate,",
            "    b.evalution_rate AS evaluationRate,",
            "    b.maturity_years AS maturityYears,",
            "    b.expired_day AS expiredDay,",
            "    b.final_profit_rate AS finalProfitRate",
            "FROM bond_products b",
//            "INNER JOIN product_risk_grade prg ON b.risk_grade_id = prg.id",
            "WHERE b.id = #{bondId}"
    })
    Optional<BondDto> selectBondById(@Param("bondId") Long bondId);



    /**
     * 상품 요약 정보 조회 - 상위 4개 카테고리만
     */
    @Select({
            "SELECT ",
            "    pc.category_name,",
            "    pcp.percentage",
            "FROM product_category_percentage pcp",
            "JOIN product_categories pc ON pcp.category_id = pc.id",
            "WHERE pcp.super_product_id = #{productId}",
            "ORDER BY pcp.percentage DESC",
            "LIMIT 4"
    })
    @Results({
            @Result(property = "categoryName", column = "category_name"),
            @Result(property = "percentage", column = "percentage")
    })
    List<CategorySummary> getTop4CategorySummary(@Param("productId") Long productId);

    /**
     * 나머지 카테고리들의 총 비중 계산
     */
    @Select({
            "SELECT COALESCE(SUM(percentage), 0) as others_percentage",
            "FROM (",
            "    SELECT percentage ",
            "    FROM product_category_percentage ",
            "    WHERE super_product_id = #{productId}",
            "    ORDER BY percentage DESC",
            "    LIMIT 18446744073709551615 OFFSET 4",
            ") others"
    })
    Double getOthersCategoryPercentage(@Param("productId") Long productId);

    /**
     * 상품 상세 정보 조회 - 상위 4개만
     */
    @Select({
            "SELECT ",
            "    pc.category_name as category,",
            "    rppd.product,",
            "    rppd.weight",
            "FROM retire_pension_product_details rppd",
            "LEFT JOIN product_categories pc ON rppd.category_id = pc.id",
            "WHERE rppd.super_product_id = #{productId}",
            "ORDER BY rppd.weight DESC",
    })
    @Results({
            @Result(property = "category", column = "category"),
            @Result(property = "product", column = "product"),
            @Result(property = "weight", column = "weight")
    })
    List<ProductDetailResponse> getProductDetails(@Param("productId") Long productId);

    /**
     * 나머지 종목들의 총 비중 계산
     */
    @Select({
            "SELECT COALESCE(SUM(weight), 0) as others_weight",
            "FROM (",
            "    SELECT weight ",
            "    FROM retire_pension_product_details ",
            "    WHERE super_product_id = #{productId}",
            "    ORDER BY weight DESC",
            "    LIMIT 18446744073709551615 OFFSET 4",
            ") others"
    })
    Double getOthersWeight(@Param("productId") Long productId);

    @Select({
            "SELECT ",
            "    rpp.product",
            "FROM retire_pension_products rpp",
            "WHERE rpp.id = #{productId}",
    })
    String getProductName(Long productId);

    @Select({
            "SELECT ",
            "   date,",
            "   final_price AS price",
            "FROM retire_pension_product_price_log",
            "WHERE retire_pension_product_id=#{productId}"
    })
    List<ProductTimeLineDto> getTimeLines(@Param("productId") Long productId);


    //===================좋아요 로직====================//

    @Select({
            "SELECT COUNT(*) FROM retire_pension_product_like",
            "WHERE user_account_id = #{userId}",
            "AND retire_pension_product_id = #{productId}"
    })
    int getProductLike(@Param("userId")Long userId, @Param("productId")Long productId);

    @Delete({
            "DELETE FROM retire_pension_product_like",
            "WHERE user_account_id = #{userId}",
            "AND retire_pension_product_id = #{productId}"
    })
    int deleteProductLike(@Param("userId") Long userId, @Param("productId") Long productId);

    @Insert({
            "INSERT INTO retire_pension_product_like(user_account_id, retire_pension_product_id)",
            "VALUES(#{userId}, #{productId})"
    })
    int addProductLike(@Param("userId") Long userId, @Param("productId") Long productId);

    @Select({
            "SELECT COUNT(*) FROM bond_product_like",
            "WHERE user_account_id = #{userId}",
            "AND bond_product_id = #{bondId}"
    })
    int getBondLike(@Param("userId")Long userId, @Param("bondId")Long bondId);

    @Delete({
            "DELETE FROM retire_pension_product_like",
            "WHERE user_account_id = #{userId}",
            "AND bond_product_id = #{bondId}"
    })
    int deleteBondLike(@Param("userId") Long userId, @Param("bondId") Long bondId);

    @Insert({
            "INSERT INTO bond_product_like(user_account_id, bond_product_id)",
            "VALUES(#{userId}, #{bondId})"
    })
    int addBondLike(@Param("userId") Long userId, @Param("bondId") Long bondId);


    @Select({
            "SELECT",
            "    b.id AS id,",
            "    b.product AS productName,",
            "    prg.grade AS riskGrade,",
            "    b.publisher_grade AS publisherGrade,",
            "    b.publisher,",
            "    b.coupon_rate AS couponRate,",
            "    b.published_rate AS publishedRate,",
            "    b.evalution_rate AS evaluationRate,",
            "    b.maturity_years AS maturityYears,",
            "    b.expired_day AS expiredDay,",
            "    b.final_profit_rate AS finalProfitRate",
            "FROM bond_products b",
            "INNER JOIN product_risk_grade prg ON b.risk_grade_id = prg.id",
            "INNER JOIN bond_product_like bpl ON b.id = bpl.bond_product_id",
            "WHERE bpl.user_account_id = #{userId}"
    })
    List<BondDto> selectLikedBonds(@Param("userId") Long userId);

    @Select({
            "SELECT ",
            "    rpp.id,",
            "    rpp.company_id,",
            "    rpp.systype_id,",
            "    rpp.product_type_id,",
            "    rpp.product,",
            "    rpp.risk_grade_id AS risk_grade,",
            "    rpp.reserve,",
            "    rpp.next_year_profit_rate,",
            "    rpp.created_at,",
            "    rpp.updated_at,",
            "    c.company AS company_name,",
            "    pt.product_type AS product_type_name,",
            "    s.systype AS systype_name",
            "FROM retire_pension_products rpp",
            "INNER JOIN companies c ON rpp.company_id = c.id",
            "INNER JOIN retire_pension_product_type pt ON rpp.product_type_id = pt.id",
            "INNER JOIN retire_pension_systype s ON rpp.systype_id = s.id",
            "INNER JOIN retire_pension_product_like rppl ON rpp.id = rppl.retire_pension_product_id",  // ✅ 수정
            "WHERE rppl.user_account_id = #{userId}"
    })
    List<PensionProduct> selectLikedProducts(@Param("userId") Long userId);


    @Select({
            "SELECT rpp.id, rpp.product, c.company, rppt.product_type ,rpp.next_year_profit_rate,rpp.risk_grade_id",
                    "FROM retire_pension_products rpp",
                    "JOIN retire_pension_product_like rppl ON rppl.retire_pension_product_id = rpp.id",
                    "JOIN companies c ON c.id = rpp.company_id",
                    "JOIN retire_pension_product_type rppt on rppt.id = rpp.product_type_id",
                    "GROUP BY rpp.id",
                    "ORDER BY COUNT(*) DESC",
                    "LIMIT 9"
    })
    List<BestLikedProductDto> selectBest9LikedProducts();


    @Update("<script>" +
            "UPDATE retire_pension_products SET next_year_profit_rate = CASE id " +
            "<foreach collection='items' item='item'>" +
            "WHEN #{item.id} THEN #{item.profit} " +
            "</foreach>" +
            "END " +
            "WHERE id IN " +
            "<foreach collection='items' item='item' open='(' separator=',' close=')'>" +
            "#{item.id}" +
            "</foreach>" +
            "</script>")
    int batchUpdateProfit(@Param("items") List<UpdateProfitRequest> items);
}