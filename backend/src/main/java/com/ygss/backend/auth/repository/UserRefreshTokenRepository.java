package com.ygss.backend.auth.repository;

import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.Optional;

@Mapper
public interface UserRefreshTokenRepository {
    @Insert("""
    INSERT INTO `user_refresh_token`(`user_id`, `refresh_token`, `exit`) VALUES
    (#{userId}, #{refreshToken}, #{exit})
    """)
    Integer insertUserRefreshToken(Long userId, String refreshToken, LocalDateTime exit);

    @Update("""
            UPDATE `user_refresh_token` SET
            `refresh_token` = #{refreshToken},
            `exit` = #{exit}
            WHERE user_id = #{userId}
            """)
    Integer updateRefreshToken(Long userId, String refreshToken, LocalDateTime exit);

    @Select("""
            SELECT refresh_token FROM `user_refresh_token`
            WHERE user_id = #{userId}
            AND `exit` > CURRENT_TIMESTAMP
            AND refresh_token = #{refreshToken};
            """)
    Optional<String> findByuserId(Long userId, String refreshToken);

    @Delete("""
            DELETE FROM `user_refresh_token`
            WHERE user_id = #{userId};
            """)
    Integer deleteFromUserId(Long userId);
}
