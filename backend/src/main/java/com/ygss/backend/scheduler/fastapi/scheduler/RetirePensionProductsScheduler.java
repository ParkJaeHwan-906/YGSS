package com.ygss.backend.scheduler.fastapi.scheduler;

import com.ygss.backend.scheduler.fastapi.dto.RetirePensionProductPriceLogSimpleDto;
import com.ygss.backend.scheduler.fastapi.dto.RetirePensionSimpleDto;
import com.ygss.backend.scheduler.fastapi.repository.RetirePensionProductPriceLogRepository;
import com.ygss.backend.scheduler.fastapi.repository.RetirePensionProductsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RetirePensionProductsScheduler {
    private final RetirePensionProductsRepository retirePensionProductsRepository;
    private final RetirePensionProductPriceLogRepository retirePensionProductPriceLogRepository;

    @Scheduled(cron = "0 0 4 * * *")
    public void updateLatestProductProfitPrediction() {
        try {
            List<RetirePensionSimpleDto> retirePensionProductList =
                    retirePensionProductsRepository.selectRetirePensionProductList();
            if(retirePensionProductList == null) throw new IllegalArgumentException("Load Retire Pension Product List Failed");
            retirePensionProductList.forEach((product) -> {
                List<RetirePensionProductPriceLogSimpleDto> productPriceLog
                        = retirePensionProductPriceLogRepository.selectRetirePensionProductPriceLog(product.getId());
                // 파이썬 호출 위치

            });
        } catch(Exception e) {
            log.error("Update Latest Product Profit Prediction Failed : {}", e.getMessage());
        }
    }
}
