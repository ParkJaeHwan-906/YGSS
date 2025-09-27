package com.ygss.backend.chatbot.service;

import com.ygss.backend.chatbot.dto.*;
import com.ygss.backend.chatbot.repository.ChatDummyRepository;
import com.ygss.backend.chatbot.repository.ChatLogsRepository;
import com.ygss.backend.chatbot.term.TermDic;
import com.ygss.backend.global.gms.GmsApiClient;
import com.ygss.backend.global.gms.dto.Gpt5MiniRequestDto;
import com.ygss.backend.global.redis.VectorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatBotServiceImpl implements ChatBotService{
    private final GmsApiClient gmsApiClient;
    private final VectorRepository vectorRepository;
    private final FastApiServiceImpl fastApiService;
    private final ChatDummyRepository chatDummyRepository;
    private final TermDictionaryServiceImpl termDictionaryService;
    private final ChatLogsRepository chatLogsRepository;
    private final TermDic termDic;

    @Override
    public ChatBotResponseDto requestAnswer(SendChatRequestDto request, String sid) {
        try {
            if(sid == null || sid.isEmpty()) sid = generateSid();
//            String jsonResult = gmsApiClient.getEmbedding(request.getMessage().replace(" ", ""));
            String jsonResult = gmsApiClient.getEmbedding(request.getMessage().replaceAll("[^가-힣a-zA-Z0-9]", ""));
            // Bi-Encoder
            List<AnswerDto> candidateList = getCandidateAnswerList(vectorRepository.searchAllPrefixes(gmsApiClient.getEmbeddingArr(jsonResult), 10));
            // Cross-Encoder
            List<AnswerDto> accurateList = getAccurateList(request.getMessage(), candidateList);
//            String answer = gmsApiClient.getGptAnswerText(gmsApiClient.getGptAnswer(new Gpt5MiniRequestDto(
//                    request.getMessage(),
//                    termDictionaryService.makeTermMap(accurateList),
//                    accurateList.stream().map(AnswerDto::getAnswer).toList(),
//                    getChatLogsBySid(sid)
//            )));
            String answer = gmsApiClient.getGeminiAnswerText(gmsApiClient.getGeminiAnswer(new Gpt5MiniRequestDto(
                    request.getMessage(),
                    termDictionaryService.makeTermMap(accurateList),
                    accurateList.stream().map(AnswerDto::getAnswer).toList(),
                    getChatLogsBySid(sid)
            )));
            if(!answer.replaceAll("[^가-힣a-zA-Z0-9]", "").equals("잘 모르겠어요. 조금 더 자세히 질문해주세요.".replaceAll("[^가-힣a-zA-Z0-9]", ""))) chatLogsRepository.insertChatLog(sid, request.getMessage(), answer);
            return ChatBotResponseDto.builder()
                    .sid(sid)
                    .answer(answer)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Message Embedding Failed : "+e.getMessage());
        }
    }

    @Override
    public List<AnswerDto> getAccurateList(String question, List<AnswerDto> candidateList) {
        return fastApiService.getAccurateList(question, candidateList);
    }

    @Override
    public List<AnswerDto> getCandidateAnswerList(List<SearchResultDto> candidateList) {
        if(candidateList.isEmpty()) return List.of();
        List<AnswerDto> candidateAnswerList = new ArrayList<>();
        candidateList.forEach((candidate) -> {
            candidateAnswerList.add(chatDummyRepository.selectAnswerById(candidate.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Not Found Chat Dummy")));
        });
        return candidateAnswerList;
    }

    @Override
    public List<ChatLogDto> getChatLogsBySid(String sid) {
        return chatLogsRepository.selectLatestQnABySid(sid);
    }

    @Override
    public String generateSid() {
        String sid = UUID.randomUUID().toString();
        while(chatLogsRepository.selectCntBySid(sid) > 0) sid = UUID.randomUUID().toString();
        return sid;
    }

    @Override
    public ChatBotResponseDto answerQuickTerm(String term, String sid) {
        if(sid == null) sid = generateSid();
        String answer = termDic.getTermMap().get(term);

        chatLogsRepository.insertChatLog(sid, term, answer);

        return ChatBotResponseDto.builder()
                .sid(sid)
                .answer(answer)
                .build();
    }
}
