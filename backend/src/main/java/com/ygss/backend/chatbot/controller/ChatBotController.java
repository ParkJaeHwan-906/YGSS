package com.ygss.backend.chatbot.controller;

import com.ygss.backend.chatbot.dto.SendChatRequestDto;
import com.ygss.backend.chatbot.service.ChatBotServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatBotController {
    private final ChatBotServiceImpl chatBotService;

    @GetMapping("/send")
    public ResponseEntity<?> sendToChatBot(SendChatRequestDto request) {
        try {
            return ResponseEntity.ok(chatBotService.requestAnswer(request));
        } catch (Exception e) {
            log.error("Send To ChatBot Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
}

