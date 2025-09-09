package com.ygss.backend.wmti.repository;

import com.ygss.backend.wmti.dto.InvestorPersonalityQuestionDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

@Mapper
public interface RiskGradeQuestionRepository {
    @Select("SELECT id AS no, question FROM risk_grade_questions")
    List<InvestorPersonalityQuestionDto> selectAllQuestion();
}
