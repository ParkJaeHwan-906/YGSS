package com.ygss.backend.global.gms;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.IOException;
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
        this.client = RestClient.create();
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
}