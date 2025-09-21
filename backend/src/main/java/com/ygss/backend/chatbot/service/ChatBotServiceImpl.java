package com.ygss.backend.chatbot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.chatbot.dto.AnswerDto;
import com.ygss.backend.chatbot.dto.SearchResultDto;
import com.ygss.backend.chatbot.dto.SendChatRequestDto;
import com.ygss.backend.chatbot.repository.ChatDummyRepository;
import com.ygss.backend.global.gms.GmsApiClient;
import com.ygss.backend.global.gms.dto.Gpt5MiniRequestDto;
import com.ygss.backend.global.redis.VectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatBotServiceImpl implements ChatBotService{
    private final GmsApiClient gmsApiClient;
    private final VectorRepository vectorRepository;
    private final FastApiServiceImpl fastApiService;
    private final ChatDummyRepository chatDummyRepository;
    private final TermDictionaryServiceImpl termDictionaryService;

    @Override
    public String requestAnswer(SendChatRequestDto request) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            String jsonResult = gmsApiClient.getEmbedding(request.getMessage());
            log.debug("Bi-Encoder Begin");
            // Bi-Encoder
            List<AnswerDto> candidateList = getCandidateAnswerList(vectorRepository.searchAllPrefixes(gmsApiClient.getEmbeddingArr(jsonResult), 10));
            log.debug("Bi-Encoder End\nresult : {}", candidateList);
            if(candidateList == null || candidateList.isEmpty()) return "잘 모르겠어요. 조금 더 자세히 질문해주세요.";
            log.debug("Cross-Encoder Begin");
            // Cross-Encoder
            List<AnswerDto> accurateList = getAccurateList(request.getMessage(), candidateList);
            log.debug("Cross-Encoder End\nresult : {}", candidateList);
            if(accurateList == null || accurateList.isEmpty()) return "잘 모르겠어요. 조금 더 자세히 질문해주세요.";
            return gmsApiClient.getAnswerText(gmsApiClient.getAnswer(new Gpt5MiniRequestDto(
                    request.getMessage(),
                    termDictionaryService.makeTermMap(accurateList),
                    accurateList.stream().map(AnswerDto::getAnswer).toList()
                    )));
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
        if(candidateList.isEmpty()) return null;
        List<AnswerDto> candidateAnswerList = new ArrayList<>();
        candidateList.forEach((candidate) -> {
            candidateAnswerList.add(chatDummyRepository.selectAnswerById(candidate.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Not Found Chat Dummy")));
        });
        return candidateAnswerList;
    }
}
