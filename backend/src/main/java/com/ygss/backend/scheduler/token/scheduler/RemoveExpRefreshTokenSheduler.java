package com.ygss.backend.scheduler.token.scheduler;

import com.ygss.backend.auth.repository.UserRefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RemoveExpRefreshTokenSheduler {
    private final UserRefreshTokenRepository userRefreshTokenRepository;

    @Scheduled(cron = "0 0 3 * * *")
    private void removeExpRefreshToken() {
        try {
            log.info("Remove Exp RefreshToken Success : REMOVE {} RefreshTokens", userRefreshTokenRepository.deleteExpRefreshToken());
        } catch (Exception e) {
            log.error("Remove Exp RefreshToken Failed : {}", e.getMessage());
        }
    }
}
