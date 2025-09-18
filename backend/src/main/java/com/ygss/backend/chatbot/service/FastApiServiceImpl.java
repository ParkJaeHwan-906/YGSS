package com.ygss.backend.chatbot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.chatbot.dto.AnswerDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FastApiServiceImpl implements FastApiService{
    @Value("${fastapi.base.url}")
    private String FAST_API_URL;

    private final RestClient client;

    public FastApiServiceImpl() { this.client = RestClient.create(); }

    @Override
    public List<AnswerDto> getAccurateList(String question, List<AnswerDto> candidateList) {
        Map<String, Object> body = Map.of(
                "question", question,
                "candidateList", candidateList
        );
        return convertToJson(client.post()
                        .uri(FAST_API_URL+"/server/compare")
                        .body(body)
                        .retrieve()
                        .body(String.class)
                );
    }

    @Override
    public List<AnswerDto> convertToJson(String jsonResult) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            // "results" 배열만 바로 AnswerDto[]로 변환 후 List로 변환
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
