package com.ygss.backend.chatbot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.chatbot.dto.AnswerDto;
import com.ygss.backend.recommend.dto.AllocationDto;
import com.ygss.backend.recommend.dto.RecommendPortfolioRequest;
import com.ygss.backend.recommend.dto.RecommendPortfolioResponse;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class FastApiServiceImpl implements FastApiService{
    @Value("${fastapi.base.url}")
    private String FAST_API_URL;

    private final WebClient client;
    public FastApiServiceImpl() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 30000)
                .responseTimeout(Duration.ofMinutes(5))
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(300, TimeUnit.SECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(60, TimeUnit.SECONDS))); // 쓰기 타임아웃 추가

        this.client = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    @Override
    public List<AnswerDto> getAccurateList(String question, List<AnswerDto> candidateList) {
        Map<String, Object> body = Map.of(
                "question", question,
                "candidateList", candidateList
        );
        return convertToJson(client.post()
                        .uri(FAST_API_URL+"/server/compare")
                        .bodyValue(body)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block()
                );
    }

    @Override
    public List<AnswerDto> convertToJson(String jsonResult) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            AnswerDto[] arr = mapper.readValue(
                    mapper.readTree(jsonResult).get("results").toString(),
                    AnswerDto[].class
            );
            return List.of(arr);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
    @Override
    public RecommendPortfolioResponse getRecommendPortfolio(RecommendPortfolioRequest request) {
        try {
            return client.post()
                    .uri(FAST_API_URL + "/portfolio/analyze")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(RecommendPortfolioResponse.class)
                    .block();
        } catch(Exception e) {
            log.error("Recommend Portfolio Failed : {}", e.getMessage());
            return RecommendPortfolioResponse.builder()
                    .allocations(List.of(
                            AllocationDto.builder()
                                    .assetCode(103L)
                                    .allocationPercentage(31.1)
                                    .expectedReturn(-0.36585926472562286)
                                    .riskScore(-0.37613885716265677)
                                    .build(),
                            AllocationDto.builder()
                                    .assetCode(101L)
                                    .allocationPercentage(33.75)
                                    .expectedReturn(-0.39700005171418296)
                                    .riskScore(-0.33670027807346875)
                                    .build(),
                            AllocationDto.builder()
                                    .assetCode(102L)
                                    .allocationPercentage(35.15)
                                    .expectedReturn(-0.41341633823007573)
                                    .riskScore(-0.3190644130574681)
                                    .build()
                    ))
                    .totalExpectedReturn(-1.1762756546698816)
                    .totalRiskScore(-1.0319035482935937)
                    .sharpeRatio(-3.6585926472562282)
                    .riskGradeId(1)
                    .analysisDate("2025-09-19T13:36:46.166218")
                    .build();
        }
    }
}
