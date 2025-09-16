package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisServiceImpl implements RedisService {
    private final TermDictionaryServiceImpl termDictionaryService;
    @Override
    public Boolean updateRedisTermDIc() {
        List<TermDictionaryResponseDto> termList = termDictionaryService.selectAllTerm();
        return true;
    }
}
