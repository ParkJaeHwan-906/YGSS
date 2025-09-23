package com.ygss.backend.chatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.chatbot.dto.ChatDummyResponseDto;
import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;
import com.ygss.backend.global.gms.GmsApiClient;
import com.ygss.backend.global.redis.VectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisServiceImpl implements RedisService {
    private final TermDictionaryServiceImpl termDictionaryService;
    private final ChatDummyServiceImpl chatDummyService;
    private final VectorRepository redisService;
    private final GmsApiClient gmsApiClient;

    @Override
    public Boolean updateRedisTermDIc() {
        List<ChatDummyResponseDto> QnAList = chatDummyService.selectAllChatDummy();

        QnAList.forEach(QnA -> {
            try {
                String jsonResult = gmsApiClient.getEmbedding(QnA.getQuestion().replace(" ", ""));
                redisService.saveVectorChunk("term", QnA.getTermId(), QnA.getId(), "Q", gmsApiClient.getEmbeddingArr(jsonResult));
            } catch (IOException e) {
                    throw new RuntimeException("Text Embedding Failed");
            }
        });
        return true;
    }
}
