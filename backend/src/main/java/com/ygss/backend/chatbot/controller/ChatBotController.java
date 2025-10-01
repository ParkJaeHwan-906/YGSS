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
                                    DB (확정급여형)는 회사가 책임지고 퇴직 시 받을 금액이 딱! 정해져 있는 🛡️안정형 퇴직금💰 제도예요. 근로자는 운용 걱정 없이 정해진 금액을 받지만, 이 때문에 내가 직접 운용하여 금액을 키울 수는 없다는 특징이 있죠.
                                    
                                    이와 달리 DC (확정기여형)는 회사가 돈을 넣어주면 내가 직접 굴려서 수익에 따라 받을 금액이 달라지는 🚀투자형 방식이에요. 내가 운용을 잘하면 더 많은 퇴직금을 받을 수 있지만, 그만큼 손실 위험도 함께 감수해야 하고 세액공제 혜택도 받을 수 있습니다.
                                    
                                    마지막으로 IRP (개인형 퇴직연금)는 회사와 관계없이 퇴직금을 포함해 개인이 자유롭게 운용하면서 세금 혜택까지 챙기는 ✨나만의 노후 준비 계좌예요. 이는 DC형과 마찬가지로 운용 성과에 따라 최종 금액이 달라지며, 회사를 옮겨도 계속 유지할 수 있는 개인 전용 통장이라는 점에서 활용도가 아주 높답니다.
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

