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
            SELECT u.name, ua.email, NULL AS 'password', ua.worked_at, ua.salary, ua.total_retire_pension FROM `users` u
            JOIN `user_accounts` ua ON ua.user_id = u.id
            WHERE ua.email LIKE #{userEmail};
            """)
    Optional<EditUserInfoResponseDto> getUserInfo(String userEmail);

}
