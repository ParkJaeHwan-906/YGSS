package com.ygss.backend.global.gms;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.global.gms.dto.Gpt5MiniRequestDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
public class GmsApiClient {
    @Value("${gms.secret.key}")
    private String GMS_KEY;
    @Value("${gms.base.url}")
    private String GMS_BASE_URL;
    @Value("${gms.openai.endpoint}")
    private String OPENAI_ENDPOINT;

    private final RestClient client;

    public GmsApiClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(30));
        factory.setReadTimeout(Duration.ofMinutes(5));

        this.client = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    public String getEmbedding(String text) throws IOException {
        Map<String, Object> body = Map.of(
                "model", "text-embedding-3-small",
                "input", text
        );
        String response = client.post()
                .uri(GMS_BASE_URL+OPENAI_ENDPOINT+"/embeddings")
                .header("Authorization", String.format("Bearer %s", GMS_KEY))
                .header("Content-Type", "application/json")
                .body(new ObjectMapper().writeValueAsString(body))
                .retrieve()
                .body(String.class);

        return response;
    }

    public float[] getEmbeddingArr(String jsonResult) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(jsonResult);
        JsonNode embeddingArray = root.path("data").get(0).path("embedding");
        float[] embedding = new float[embeddingArray.size()];
        for (int j = 0; j < embeddingArray.size(); j++) {
            embedding[j] = embeddingArray.get(j).floatValue();
        }

        return embedding;
    }
    private final Gpt5MiniRequestDto developer
            = new Gpt5MiniRequestDto(
                "developer",
            """
                   I will provide basic words, definitions, and example Q&A pairs. Based on them, write an answer to the user’s question. Boldly remove any irrelevant words, definitions, or examples. Write the answer in Korean, separating paragraphs for readability. Keep it concise and explain within 400 characters. If the question is not related to finance, retirement pensions, or financial products, only respond with: "잘 모르겠어요. 조금 더 자세히 질문해주세요."
                    """
            );
    public String getAnswer(Gpt5MiniRequestDto user) throws IOException {
        Map<String, Object> body = Map.of(
                "model", "gpt-5-nano",
                "messages", List.of(
                        developer,
                        user
                )
        );

        return client.post()
                .uri(GMS_BASE_URL+OPENAI_ENDPOINT+"/chat/completions")
                .header("Authorization", String.format("Bearer %s", GMS_KEY))
                .header("Content-Type", "application/json")
                .body(new ObjectMapper().writeValueAsString(body))
                .retrieve()
                .body(String.class);
    }

    public String getAnswerText(String jsonResult) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(jsonResult);
        JsonNode answerText = root.path("choices").get(0).path("message").path("content");
        return answerText.asText();
    }
}