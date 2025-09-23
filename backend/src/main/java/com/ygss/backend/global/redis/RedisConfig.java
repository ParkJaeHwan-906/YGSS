package com.ygss.backend.global.redis;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.Jedis;

@Configuration
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String host;
    @Value("${spring.redis.port}")
    private int port;
    @Value("${spring.redis.password}")
    private String password;


    @Bean
    public Jedis jedis() {
        Jedis jedis = new Jedis(host, port);
//        if (password != null && !password.isEmpty()) {
//            jedis.auth(password);
//        }
        return jedis;
    }
}
