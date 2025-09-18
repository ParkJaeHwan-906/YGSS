package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.AnswerDto;
import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;

import java.util.List;
import java.util.Map;

public interface TermDictionaryService {
    List<TermDictionaryResponseDto> selectAllTerm();
    Map<Long, TermDictionaryResponseDto> makeTermMap(List<AnswerDto> accurateList);
}
