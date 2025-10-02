// src/utils/getDcBubbleText.ts
import { AssetGroup, CurrentTab } from "@/components/organisms/Tab";

export type DcBubble = { title: string; desc: string };

export function getDcBubbleText(
  hasInteracted: boolean,
  group: AssetGroup,
  currentTab: CurrentTab
): DcBubble {
  if (!hasInteracted) {
    return {
      title: "DC",
      desc: "DC형은 매달 적립금을 본인이 운용해요. 수익·위험을 스스로 선택하는 대신,\n분산과 비용 체크가 중요✨",
    };
  }

  // 위험자산
  if (group === "위험자산") {
    switch (currentTab) {
      case "전체":
        return {
          title: "DC",
          desc: "DC형은 매달 적립금을 본인이 운용해요. 수익·위험을 스스로 선택하는 대신,\n분산과 비용 체크가 중요✨",
        };
      case "ETF":
        return {
          title: "ETF",
          desc: "ETF는 지수 추종 + 분산이 핵심! 보수(총보수)와 추적오차도 함께 확인해봐 🧐",
        };
      case "펀드":
        return {
          title: "펀드",
          desc: "펀드는 운용사 트랙레코드와\n스타일이 중요! 분기 운용보고서로\n전략을 살펴보자 😉",
        };
    }
  }

  // 안전자산 (채권)
  return {
    title: "채권",
    desc: "채권은 안정성이 장점!\n만기, 금리(세전/세후)와 신용등급을 비교해서 든든하게 가져가자 😎",
  };
}