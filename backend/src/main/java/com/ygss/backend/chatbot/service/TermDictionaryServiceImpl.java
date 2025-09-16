package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;
import com.ygss.backend.chatbot.repository.TermDictionaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TermDictionaryServiceImpl implements TermDictionaryService{
    private final TermDictionaryRepository termDictionaryRepository;

    @Override
    public List<TermDictionaryResponseDto> selectAllTerm() {
        return termDictionaryRepository.selectAllTerm();
    }
}
