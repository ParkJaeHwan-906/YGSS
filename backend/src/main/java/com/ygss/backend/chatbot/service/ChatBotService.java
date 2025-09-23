package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.*;

import java.util.List;

public interface ChatBotService {
    ChatBotResponseDto requestAnswer(SendChatRequestDto request, String sid);
    List<AnswerDto> getAccurateList(String question, List<AnswerDto> candidateList);
    List<AnswerDto> getCandidateAnswerList(List<SearchResultDto> candidateList);
    List<ChatLogDto> getChatLogsBySid(String sid);
    String generateSid();
}
