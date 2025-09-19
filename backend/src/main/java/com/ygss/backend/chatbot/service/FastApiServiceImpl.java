package com.ygss.backend.chatbot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.chatbot.dto.AnswerDto;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

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
}
