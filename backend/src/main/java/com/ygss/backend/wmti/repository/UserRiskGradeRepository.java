package com.ygss.backend.wmti.repository;

import com.ygss.backend.wmti.dto.InvestorPersonerlityListDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserRiskGradeRepository {
    @Select("SELECT grade FROM `user_risk_grade` WHERE `id` = #{id}")
    Optional<String> selectRiskGradeById(Long id);

    @Select("SELECT id, grade FROM `user_risk_grade`")
    List<InvestorPersonerlityListDto> selectAllRiskGrade();
}
