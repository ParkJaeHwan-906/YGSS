package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.AnswerDto;
import com.ygss.backend.chatbot.dto.SearchResultDto;

import java.util.List;

public interface FastApiService {
    List<AnswerDto> getAccurateList(String question, List<AnswerDto> candidateList);
    List<AnswerDto> convertToJson(String jsonResult);
}
