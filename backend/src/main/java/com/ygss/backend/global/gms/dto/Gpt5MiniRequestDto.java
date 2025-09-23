package com.ygss.backend.global.gms.dto;

import com.ygss.backend.chatbot.dto.ChatLogDto;
import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class Gpt5MiniRequestDto {
    private String role;
    private String content;

    public Gpt5MiniRequestDto(String question, Map<Long, TermDictionaryResponseDto> termMap, List<String> answerList, List<ChatLogDto> chatLogs) {
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

        // 이전 채팅 기록 생성
        StringBuilder chatLogText = new StringBuilder();
        for(ChatLogDto chatLog : chatLogs) {
            chatLogText.append("Q. ").append(chatLog.getQuestion())
                    .append("\nA. ").append(chatLog.getAnswer()).append("\n\n");
        }

        // 최종 content 생성
        this.content = """
                My question is as below:
                    %s
                
                    The related words are as follows:
                    %s
                
                    The answers that are most similar to my question are as follows:
                    %s
                
                    If there are no similar answers, please analyze the previous conversation flow and generate a response based on the context. When analyzing the previous conversation, start with the most recent dialogue. If no relevant context or topic is found, go further back step by step until you can understand the flow.
                
                    The previous conversation flow is as follows:
                    %s
                
                    Please refer to the above materials, analyze the similar answers and the previous conversation flow, and generate a response that fits naturally and appropriately to the user’s question.
            """.formatted(termText.toString(), question, answerText.toString(), chatLogText.toString());
    }

    public Gpt5MiniRequestDto(String role, String content) {
        this.role = role;
        this.content = content;
    }
}
