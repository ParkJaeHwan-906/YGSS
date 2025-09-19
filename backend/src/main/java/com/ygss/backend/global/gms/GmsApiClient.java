package com.ygss.backend.global.gms;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.global.gms.dto.Gpt5MiniRequestDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
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
                    I'll give you basic words and definitions, and I'll give you questions and answers that are most similar. 
                    Based on that information, please create an answer to the user's question. 
                    Please boldly remove and answer any words, definitions, and examples of answers that you think are irrelevant to the user's question. 
                    Do not use Markdown formatting. Instead, present the answer in plain text, clearly separating paragraphs for better readability. 
                    Lastly, please answer all questions in Korean. Make sure that the answer is concise and stays within 270 tokens.
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