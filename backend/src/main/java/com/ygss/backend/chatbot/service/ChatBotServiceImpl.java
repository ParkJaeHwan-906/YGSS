package com.ygss.backend.chatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.chatbot.dto.SendChatRequestDto;
import com.ygss.backend.chatbot.repository.TermDictionaryRepository;
import com.ygss.backend.global.gms.GmsApiClient;
import com.ygss.backend.global.redis.VectorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatBotServiceImpl implements ChatBotService{
    private final GmsApiClient gmsApiClient;
    private final VectorRepository vectorRepository;
    private final TermDictionaryRepository termDictionaryRepository;

    @Override
    public Boolean requestAnswer(SendChatRequestDto request) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            String jsonResult = gmsApiClient.getEmbedding(request.getMessage());
            JsonNode root = mapper.readTree(jsonResult);
            JsonNode embeddingArray = root.path("data").get(0).path("embedding");

            float[] embedding = new float[embeddingArray.size()];
            for (int i = 0; i < embeddingArray.size(); i++) {
                embedding[i] = embeddingArray.get(i).floatValue();
            }
            System.out.println(vectorRepository.searchAllPrefixes(embedding, 100));
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Message Embedding Failed : "+e.getMessage());
        }
    }
}
