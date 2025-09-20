package com.ygss.backend.recommend.repository;

import com.ygss.backend.recommend.dto.entity.UserPortfolioCache;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.Optional;

@Mapper
public interface RecommendCacheRepository {

    @Select({
            "SELECT user_id, salary, total_retire_pension, risk_grade_id, ",
            "total_expected_return, allocations, analysis_date, ",
            "created_at, updated_at ",
            "FROM user_portfolio_cache ",
            "WHERE user_id = #{userId}"
    })
    Optional<UserPortfolioCache> findByUserId(@Param("userId") Long userId);


    @Insert({
            "INSERT INTO user_portfolio_cache ",
            "(user_id, salary, total_retire_pension, risk_grade_id, total_expected_return, allocations, analysis_date) ",
            "VALUES (#{userId}, #{salary}, #{totalRetirePension}, #{riskGradeId}, #{totalExpectedReturn}, #{allocations}, #{analysisDate}) ",
            "ON DUPLICATE KEY UPDATE ",
            "salary = VALUES(salary), ",
            "total_retire_pension = VALUES(total_retire_pension), ",
            "risk_grade_id = VALUES(risk_grade_id), ",
            "total_expected_return = VALUES(total_expected_return), ",
            "allocations = VALUES(allocations), ",
            "analysis_date = VALUES(analysis_date), ",
            "updated_at = CURRENT_TIMESTAMP"
    })
    void upsert(UserPortfolioCache cache);
}
