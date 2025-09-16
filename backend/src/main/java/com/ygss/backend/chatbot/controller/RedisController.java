package com.ygss.backend.chatbot.controller;

import com.ygss.backend.chatbot.service.RedisServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/redis")
public class RedisController {
    private final RedisServiceImpl redisService;

    @PostMapping("/update")
    public ResponseEntity<?> updateRedisTermDic() {
        try {
            return ResponseEntity.ok(redisService.updateRedisTermDIc());
        } catch (Exception e) {
            log.error("Update Redis Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
}
