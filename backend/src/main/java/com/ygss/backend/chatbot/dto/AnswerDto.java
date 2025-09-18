package com.ygss.backend.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AnswerDto {
    private Long termId;
    private String answer;
}
