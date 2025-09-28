package com.ygss.backend.global.gms;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.global.gms.dto.GeminiRequestDto;
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
    @Value("${gms.gemini.endpoint}")
    private String GEMINI_ENDPOINT;

    private final RestClient client;

    public GmsApiClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(60));
        factory.setReadTimeout(Duration.ofMinutes(10));

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
                    I will provide basic words, definitions, and example Q&A pairs. Based on them, write an answer to the user’s question. Boldly remove any irrelevant words, definitions, or examples. Write the answer in Korean, separating paragraphs for readability. Keep it concise and explain within 180 characters.
                    
                    The answer must be:
                    1. Explained in a way that is easy to understand, as if kindly teaching an elementary school student!!
                    2. Written in a friendly conversational tone using “~요” instead of “~입니다”. Use exclamation marks (!), question marks (?), emojis, and cute symbols like “ㅎㅎ” or “~” to make it feel warm, kind, and approachable!!
                    
                    If the question is not related to finance, retirement pensions, or financial products, only respond with: "잘 모르겠어요. 조금 더 자세히 질문해주세요!"
                    """
            );
    public String getGptAnswer(Gpt5MiniRequestDto user) throws IOException {
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

    public String getGeminiAnswer(Gpt5MiniRequestDto user) throws IOException {
        GeminiRequestDto request = new GeminiRequestDto(user.getContent());
        return client.post()
                .uri(GMS_BASE_URL+GEMINI_ENDPOINT+String.format("?key=%s", GMS_KEY))
                .header("Content-Type", "application/json")
                .body(new ObjectMapper().writeValueAsString(request))
                .retrieve()
                .body(String.class);
    }

    public String getGptAnswerText(String jsonResult) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(jsonResult);
        JsonNode answerText = root.path("choices").get(0).path("message").path("content");
        return answerText.asText();
    }

    public String getGeminiAnswerText(String jsonResult) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(jsonResult);

        // 1. "candidates" 배열에 접근합니다. (OpenAI의 "choices"와 유사)
        JsonNode candidates = root.path("candidates");

        // 2. 첫 번째 후보(get(0))에서 "content" 객체에 접근합니다.
        // 3. "content" 객체에서 "parts" 배열에 접근합니다.
        // 4. "parts" 배열의 첫 번째 요소(get(0))에서 "text" 필드에 접근합니다.
        JsonNode answerNode = candidates
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text");

        // 5. 최종적으로 텍스트 값을 추출합니다.
        return answerNode.asText();
    }
}