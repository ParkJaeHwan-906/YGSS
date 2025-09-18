package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.AnswerDto;
import com.ygss.backend.chatbot.dto.SearchResultDto;
import com.ygss.backend.chatbot.dto.SendChatRequestDto;

import java.util.List;

public interface ChatBotService {
    String requestAnswer(SendChatRequestDto request);
    List<AnswerDto> getAccurateList(String question, List<AnswerDto> candidateList);
    List<AnswerDto> getCandidateAnswerList(List<SearchResultDto> candidateList);
}
