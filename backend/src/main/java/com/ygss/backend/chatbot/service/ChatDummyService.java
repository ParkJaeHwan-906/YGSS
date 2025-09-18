package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.ChatDummyResponseDto;

import java.util.List;

public interface ChatDummyService {
    List<ChatDummyResponseDto> selectAllChatDummy();
}
