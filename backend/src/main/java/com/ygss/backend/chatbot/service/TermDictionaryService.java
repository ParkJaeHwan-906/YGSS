package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;

import java.util.List;

public interface TermDictionaryService {
    List<TermDictionaryResponseDto> selectAllTerm();
}
