package com.ygss.backend.user.repository;

import com.ygss.backend.user.dto.EditUserInfoResponseDto;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.Optional;

@Mapper
public interface UsersRepository {
    @Insert("INSERT INTO `users`(`name`) VALUE (#{name})")
    Integer insertUser(String name);

    @Select("SELECT LAST_INSERT_ID()")
    Long getLastUserIdx();

    @Select("SELECT name FROM users WHERE id = #{userId}")
    String getUserNameById(Long userId);

    @Select("""
            SELECT u.name, ua.email, NULL AS 'password', ua.new_Emp, ua.salary, ua.total_retire_pension, ua.risk_grade_id, urg.grade AS 'riskGrade'
            			FROM `users` u
                        JOIN `user_accounts` ua ON ua.user_id = u.id
            			LEFT JOIN `user_risk_grade` urg ON urg.id = ua.risk_grade_id
                        WHERE ua.email LIKE #{userEmail}
                        AND ua.exit IS NULL;
            """)
    Optional<EditUserInfoResponseDto> getUserInfo(String userEmail);

}