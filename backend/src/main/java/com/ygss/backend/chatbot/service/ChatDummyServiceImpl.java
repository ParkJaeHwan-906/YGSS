package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.ChatDummyResponseDto;
import com.ygss.backend.chatbot.repository.ChatDummyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatDummyServiceImpl implements ChatDummyService{
    private final ChatDummyRepository chatDummyRepository;
    @Override
    public List<ChatDummyResponseDto> selectAllChatDummy() {
        return chatDummyRepository.selectAllChatDummy();
    }
}
