package com.ygss.backend.chatbot.term;

import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.Map;

@Getter
@Component
public class TermDic {
    private Map<String, String> termMap
            = Map.of(
            "DB", "확정급여형 연금이에요! 회사가 약속한 만큼 퇴직할 때 돈을 주는 제도예요 😊",
            "DC", "확정기여형 연금이에요! 회사가 일정 금액을 넣어주고 내가 직접 굴려서 퇴직금을 모으는 방식이에요 💰",
            "IRP", "개인형 퇴직연금이에요! 퇴직금이나 내 돈을 모아두고 나중에 노후에 쓰는 통장이에요 🏦",
            "채권", "정부나 회사가 돈 빌릴 때 주는 종이예요~ 이자를 받고 나중에 원금도 돌려받을 수 있어요 📜",
            "펀드", "사람들이 돈을 모아서 전문가가 대신 투자해주는 거예요! 같이 이익을 나누는 상품이에요 📈",
            "ETF", "주식처럼 사고팔 수 있는 펀드예요~ 어떤 지수나 자산을 따라 움직이는 투자 상품이에요 🔄"
    );
}
