package com.ygss.backend.chatbot.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ChatBotResponseDto {
    private String sid;
    private String answer;
}
