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
                                    DB는 회사가 운용을 책임지고, 근로자는 퇴직 시 정해진 금액을 🛡️확정적으로 받는💰 안정형 제도입니다. 임금 상승률이 높을 때 유리해요!
                                    
                                    DC는 회사가 매년 일정 부담금을 내주면, 내가 직접 투자해 수익에 따라 최종 퇴직금이 결정되는 🚀운용형 방식이에요. 투자에 자신 있다면 유리하죠!
                                    
                                    IRP는 퇴직금 등을 모아 나 스스로 굴리는 ✨개인 전용 계좌예요. 이직 시 퇴직금을 모으거나, 추가 납입 시 💰세액공제 혜택💰을 받을 수 있어요.
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

