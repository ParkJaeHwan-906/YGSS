package com.ygss.backend.user.repository;

import com.ygss.backend.user.dto.UserAccountsDto;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserAccountsRepository {
    @Insert("INSERT INTO `user_accounts`(`user_id`, `email`, `password`, `worked_at`, `salary`, `total_retire_pension`)" +
            "VALUES(#{userId}, #{email}, #{password}, #{workedAt}, #{salary}, #{totalRetirePension})")
    Integer insertUserAccount(Long userId, String email, String password, Integer workedAt, Integer salary, Integer totalRetirePension);

    @Select("SELECT * FROM user_accounts WHERE email LIKE #{userEmail}")
    UserAccountsDto selectByUserEmail(String userEmail);
}
