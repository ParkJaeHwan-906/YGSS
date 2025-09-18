package com.ygss.backend.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SearchResultDto {
    private final String prefix;
    private final Long termId;
    private final Long id;
    private final String type;
    private final double similarity;
}

