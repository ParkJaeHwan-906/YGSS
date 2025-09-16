package com.ygss.backend.global.gms;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class GmsApiClient {
    @Value("{$openai.secret}")
    private String GMS_KEY;
    private final RestClient client;

    public GmsApiClient() {
        this.client = RestClient.builder()
                .baseUrl("https://gms.ssafy.io/gmsapi/")
                .defaultHeader("Authorization", "Bearer "+GMS_KEY)
                .build();
    }
}
