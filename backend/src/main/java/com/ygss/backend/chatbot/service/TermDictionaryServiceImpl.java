package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.AnswerDto;
import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;
import com.ygss.backend.chatbot.repository.TermDictionaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TermDictionaryServiceImpl implements TermDictionaryService{
    private final TermDictionaryRepository termDictionaryRepository;

    @Override
    public List<TermDictionaryResponseDto> selectAllTerm() {
        return termDictionaryRepository.selectAllTerm();
    }

    @Override
    public Map<Long, TermDictionaryResponseDto> makeTermMap(List<AnswerDto> accurateList) {
        Map<Long, TermDictionaryResponseDto> termMap = new HashMap<>();
        accurateList.forEach((answer) -> {
            if(!termMap.containsKey(answer.getTermId())) {
                termMap.put(answer.getTermId(), termDictionaryRepository.selectTermById(answer.getTermId())
                        .orElseThrow(() -> new IllegalArgumentException("Not Fount Term Desc")));
            }
        });
        return termMap;
    }
}
