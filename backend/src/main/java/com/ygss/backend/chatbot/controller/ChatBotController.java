package com.ygss.backend.chatbot.controller;

import com.ygss.backend.chatbot.dto.ChatBotResponseDto;
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
//            return ResponseEntity.ok(chatBotService.requestAnswer(request, sid));
            Thread.sleep(1300);
            return ResponseEntity.ok(ChatBotResponseDto.builder()
                            .sid(sid)
                            .answer("""
                                    DB, DC, IRP 각 차이점에 대해서 설명해드릴게요!
                                    DB는 회사가 운용 책임, 퇴직 시 받을 금액이 🛡️확정되어 있어요. (안정적)
                                    
                                    DC는 내가 직접 굴려 수익을 내는 🚀투자형이에요. 운용 성과에 따라 최종 금액이 달라져요.
                                    
                                    IRP는 퇴직금 등을 모아 내가 운용하는 ✨개인 전용 계좌예요. 세액공제 혜택이 가장 커요.
                                    """)
                    .build());
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

