package com.ygss.backend.chatbot.dto;

import lombok.Data;

@Data
public class ChatDummyResponseDto {
    private Long id;
    private Long termId;
    private String question;
    private String answer;
}
