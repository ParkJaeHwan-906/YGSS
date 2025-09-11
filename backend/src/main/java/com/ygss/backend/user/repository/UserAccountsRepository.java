package com.ygss.backend.user.repository;

import com.ygss.backend.user.dto.UserAccountsDto;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.Optional;

@Mapper
public interface UserAccountsRepository {
    @Insert("INSERT INTO `user_accounts`(`user_id`, `email`, `password`, `new_emp`, `salary`, `total_retire_pension`)" +
            "VALUES(#{userId}, #{email}, #{password}, #{newEmp}, #{salary}, #{totalRetirePension})")
    Integer insertUserAccount(Long userId, String email, String password, Boolean newEmp, Long salary, Long totalRetirePension);

    @Select("SELECT * FROM user_accounts WHERE email LIKE #{userEmail} AND `exit` IS NULL")
    Optional<UserAccountsDto> selectByUserEmail(String userEmail);

    @Select("SELECT COUNT(*) FROM user_accounts WHERE email LIKE #{userEmail}")
    Integer selectCountByUserEmail(String userEmail);

    @Select("SELECT * FROM user_accounts WHERE user_id = #{userId} AND `exit` IS NULL")
    Optional<UserAccountsDto> selectByUserId(Long userId);

    @Select("SELECT password FROM user_accounts WHERE email LIKE #{userEmail}")
    String getPasswordByUserEmail(String userEmail);

    @Select("SELECT user_id FROM user_accounts WHERE email LIKE #{userEmail} AND `exit` IS NULL")
    Optional<Long> selectUserIdByEmail(String userEmail);

    @Select("SELECT risk_grade_id FROM user_accounts WHERE email LIKE #{userEmail}")
    Optional<Long> selectRiskGradeIdByUserEmail(String Email);

    @Update("""
            UPDATE `user_accounts` SET
            `password` = #{password},
            `new_emp` = #{newEmp},
            `salary` = #{salary},
            `total_retire_pension` = #{totalRetirePension}
            WHERE `email` LIKE #{userEmail};
            """)
    Integer updateUserAccount(String userEmail, String password, Boolean newEmp, Long salary, Long totalRetirePension);

    @Update("""
            UPDATE `user_accounts` SET
            `exit` = CURRENT_TIMESTAMP
            WHERE `email` LIKE #{userEmail};
            """)
    Integer updateUserExit(String userEmail);

    @Update("""
            UPDATE `user_accounts` SET
            `risk_grade_id` = #{riskGradeId}
            WHERE `email` LIKE #{userEmail};
            """)
    Integer updateUserRiskGrade(String userEmail, Long riskGradeId);
}
