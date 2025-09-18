package com.ygss.backend.global.gms.dto;

import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class Gpt5MiniRequestDto {
    private String role;
    private String content;

    public Gpt5MiniRequestDto(String question, Map<Long, TermDictionaryResponseDto> termMap, List<String> answerList) {
        this.role = "user";

        // 단어 및 정의 문자열 생성
        StringBuilder termText = new StringBuilder();
        for (Map.Entry<Long, TermDictionaryResponseDto> entry : termMap.entrySet()) {
            TermDictionaryResponseDto dto = entry.getValue();
            termText.append("Word: ").append(dto.getTerm())
                    .append("\nDefinition: ").append(dto.getDesc())
                    .append("\n\n");
        }

        // 답변 리스트 문자열 생성
        StringBuilder answerText = new StringBuilder();
        for (String ans : answerList) {
            answerText.append(ans).append("\n");
        }

        // 최종 content 생성
        this.content = """
            The related words are as follows
            %s
            My question is as below
            %s
            The answers that are most similar to my questions are as follows
            %s
            Please refer to the above materials and give me an answer
            """.formatted(termText.toString(), question, answerText.toString());
    }

    public Gpt5MiniRequestDto(String role, String content) {
        this.role = role;
        this.content = content;
    }
}
