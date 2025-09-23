package com.ygss.backend.chatbot.controller;

import com.ygss.backend.chatbot.dto.SendChatRequestDto;
import com.ygss.backend.chatbot.service.ChatBotServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatBotController {
    private final ChatBotServiceImpl chatBotService;

    @PostMapping({"/send/", "/send/{sid}"})
    public ResponseEntity<?> sendToChatBot(@RequestBody SendChatRequestDto request, @PathVariable(required = false) String sid) {
        try {
            return ResponseEntity.ok(chatBotService.requestAnswer(request, sid));
        } catch (Exception e) {
            log.error("Send To ChatBot Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    @GetMapping({"/send/{term}/", "/send/{term}/{sid}"})
    public ResponseEntity<?> sendToChatBotTerm(@PathVariable String term, @PathVariable(required = false) String sid) {
        try {

            return ResponseEntity.ok(chatBotService.answerQuickTerm(term, sid));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("처리 중 문제가 발생했어요. 다시 시도해주세요.");
        }
    }
}

