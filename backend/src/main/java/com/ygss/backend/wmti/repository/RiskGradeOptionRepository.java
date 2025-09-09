package com.ygss.backend.wmti.repository;

import com.ygss.backend.wmti.dto.InvestorPersonalityOptionDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RiskGradeOptionRepository {
    @Select("""
            SELECT `score` AS 'no', `option`, `score` FROM `risk_grade_options`
            WHERE `question_id` = #{questionId};
            """)
    List<InvestorPersonalityOptionDto> getQuestionOptions(Long questionId);
}
