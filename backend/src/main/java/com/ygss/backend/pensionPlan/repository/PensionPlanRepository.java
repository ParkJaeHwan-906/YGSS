package com.ygss.backend.pensionPlan.repository;

import com.ygss.backend.pensionPlan.dto.request.PensionPlanSearchRequest;
import com.ygss.backend.pensionPlan.dto.response.PensionPlanSearchResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Mapper
public interface PensionPlanRepository {

    @Select({
            "<script>",
            "SELECT ",
            "    c.company AS companyName,",
            "    s.systype AS systype,",
            "    r.reserve,",
            "    r.earn_rate AS earnRate,",
            "    CASE WHEN r.systype_id = 1 THEN NULL ELSE r.earn_rate3 END AS earnRate3,",
            "    CASE WHEN r.systype_id = 1 THEN NULL ELSE r.earn_rate5 END AS earnRate5,",
            "    CASE WHEN r.systype_id = 1 THEN NULL ELSE r.earn_rate7 END AS earnRate7,",
            "    CASE WHEN r.systype_id = 1 THEN NULL ELSE r.earn_rate10 END AS earnRate10,",
            "    r.id",
            "FROM retire_pension_rate r",
            "INNER JOIN companies c ON r.company_id = c.id",
            "INNER JOIN retire_pension_systype s ON r.systype_id = s.id",
            "<where>",
            "    <if test='companyId != null'>",
            "        AND r.company_id = #{companyId}",
            "    </if>",
            "    <if test='systypeId != null'>",
            "        AND r.systype_id = #{systypeId}",
            "    </if>",
            "    <if test='companyName != null and companyName != \"\"'>",
            "        AND c.company LIKE CONCAT('%', #{companyName}, '%')",
            "    </if>",
            "</where>",
            "ORDER BY c.company, s.systype",
            "</script>"
    })
    List<PensionPlanSearchResponse> selectPensionPlans(PensionPlanSearchRequest searchDto);

    @Select({
            "SELECT",
            "    c.company AS companyName,",
            "    s.systype AS systype,",
            "    r.reserve,",
            "    r.earn_rate AS earnRate,",
            "    CASE WHEN r.systype_id = 1 THEN NULL ELSE r.earn_rate3 END AS earnRate3,",
            "    CASE WHEN r.systype_id = 1 THEN NULL ELSE r.earn_rate5 END AS earnRate5,",
            "    CASE WHEN r.systype_id = 1 THEN NULL ELSE r.earn_rate7 END AS earnRate7,",
            "    CASE WHEN r.systype_id = 1 THEN NULL ELSE r.earn_rate10 END AS earnRate10,",
            "    r.id",
            "FROM retire_pension_rate r",
            "INNER JOIN companies c ON r.company_id = c.id",
            "INNER JOIN retire_pension_systype s ON r.systype_id = s.id",  // ← 정확한 테이블명
            "WHERE r.id = #{pensionPlanId}"
    })
    Optional<PensionPlanSearchResponse> selectPensionPlanById(@Param("pensionPlanId") Long pensionPlanId);
}