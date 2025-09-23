package com.ygss.backend.scheduler.redis;

import com.ygss.backend.chatbot.service.RedisServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisScheduler {
    private final RedisServiceImpl redisService;

    @Scheduled(fixedRate = 1000*60*60*6)    // 6 시간 단위로
    public void updateTextEmbeddingVector() {
        try {
            log.info("Scheduler Excute : Redis Text Embedding Update");
            redisService.updateRedisTermDIc();
            log.info("Scheduler Executed");
        } catch (Exception e) {
            log.error("Text Embedding Scheduler Failed : {}", e.getMessage());
        }
    }
}

