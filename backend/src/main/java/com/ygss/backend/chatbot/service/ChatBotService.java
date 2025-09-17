package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.SendChatRequestDto;

public interface ChatBotService {
    Boolean requestAnswer(SendChatRequestDto request);
}
