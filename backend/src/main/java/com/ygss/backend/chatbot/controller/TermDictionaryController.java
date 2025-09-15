package com.ygss.backend.chatbot.controller;

import com.ygss.backend.chatbot.service.TermDictionaryServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/chatbot")
public class TermDictionaryController {
    private final TermDictionaryServiceImpl termDictionaryService;

    @GetMapping("/term/list")
    public ResponseEntity<?> selectAllTerm() {
        try {
            return ResponseEntity.ok(termDictionaryService.selectAllTerm());
        } catch (Exception e) {
            log.error("Select All Term Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
}
