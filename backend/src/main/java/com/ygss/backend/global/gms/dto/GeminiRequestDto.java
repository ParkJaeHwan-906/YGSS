package com.ygss.backend.global.gms.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GeminiRequestDto {
    private List<Object> contents;

    public GeminiRequestDto(String message) {
        this.contents = List.of(
                Map.of(
                        "role", "user",
                        "parts", List.of(
                                Map.of(
                                        "text", """
                                                I will provide basic words, definitions, and example Q&A pairs. Based on them, write an answer to the user’s question. Boldly remove any irrelevant words, definitions, or examples. Write the answer in Korean, separating paragraphs for readability. Keep it concise and explain within 180 characters.
                                                
                                                                            The answer must be:
                                                                            1. Explained in a way that is easy to understand, as if kindly teaching an elementary school student!!
                                                                            2. Written exclusively in a polite and friendly conversational tone using the '요' ending (e.g., '~요', '~세요'). **Crucially, never use informal speech (반말) or the overly formal '습니다' ending ('~입니다', '~습니다').** Do not use Markdown language (like bolding or lists). Use exclamation marks (!), question marks (?), emojis, and cute symbols like “ㅎㅎ” or “~” to make it feel warm, kind, and approachable!!
                                                
                                                                            If the question is not related to finance, retirement pensions, or financial products, only respond with: "잘 모르겠어요. 조금 더 자세히 질문해주세요!\""
                    """ + message
                                )
                        )
                )
        ) ;
    }
}
