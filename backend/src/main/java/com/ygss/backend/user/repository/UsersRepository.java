package com.ygss.backend.user.repository;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UsersRepository {
    @Insert("INSERT INTO `users`(`name`) VALUE (#{name})")
    Integer insertUser(String name);

    @Select("SELECT LAST_INSERT_ID()")
    Long getLastUserIdx();

    @Select("SELECT name FROM users WHERE id = #{userId}")
    String getUserNameById(Long userId);
}
