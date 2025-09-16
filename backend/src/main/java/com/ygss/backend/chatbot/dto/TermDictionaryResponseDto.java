package com.ygss.backend.chatbot.dto;

import lombok.Data;

@Data
public class TermDictionaryResponseDto {
    private Long id;
    private String term;
    private String desc;
}
