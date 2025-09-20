// ListItem.tsx
// import MarqueeTitle from "@/components/molecules/MarqueeTitle";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const RISK_STYLE = {
  낮음: { badgeBg: "#7F8AF3", rateColor: "#7F8AF3" },
  보통: { badgeBg: "#8FCE6A", rateColor: "#8FCE6A" },
  다소높음: { badgeBg: "#FFDC00", rateColor: "#FFDC00" },
  높음: { badgeBg: "#FF9E9E", rateColor: "#FF9E9E" },
  매우높음: { badgeBg: "#FF7171", rateColor: "#FF7171" },
} as const;

type RiskLevel = keyof typeof RISK_STYLE;

function normalizeRisk(input?: string): RiskLevel {
  const v = (input ?? "").replace(/\s+/g, ""); // 공백 제거
  if (v === "낮음") return "낮음";
  if (v === "보통") return "보통";
  if (v === "다소높음" || v === "다소높") return "다소높음";
  if (v === "높음") return "높음";
  if (v === "매우높음" || v === "매우높") return "매우높음";
  return "보통"; // 기본값
}

type ListItemProps = {
  title: string;
  subTitle: string;
  rate: number;
  risk?: string; // ← 문자열 아무거나 와도 OK, 내부에서 정규화
  onPress?: () => void;
  rateColorBy?: "risk" | "direction";
};

export default function ListItem({
  title,
  subTitle,
  rate,
  risk = "보통",
  onPress,
  rateColorBy = "risk",
}: ListItemProps) {
  const riskKey = normalizeRisk(risk);
  const { badgeBg, rateColor } = RISK_STYLE[riskKey];

  const isUp = rate >= 0;
  const rateText = `${isUp ? "+" : ""}${rate.toFixed(2)}%`;

  const rateStyle =
    rateColorBy === "risk"
      ? { color: rateColor }
      : { color: isUp ? "#FF2C2C" : "#2F6FFF" };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <View style={styles.subRow}>
          <Text style={styles.sub}>{subTitle}</Text>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={styles.badgeText}>{riskKey}</Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.rateBase, rateStyle]}>{rateText}</Text>
        <Ionicons name="chevron-forward" size={18} color="#111" style={styles.arrow} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    flexDirection: "row", alignItems: "center", paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#E8EBF1",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2,
  },
  textWrap: { flex: 1, overflow: "hidden" },
  title: { fontFamily: "BasicBold", fontSize: 16, color: "#111" },
  subRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  sub: { fontFamily: "BasicMedium", fontSize: 13, color: "#9AA0A6", marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontFamily: "BasicMedium", fontSize: 12, color: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  right: { flexDirection: "row", alignItems: "center" },
  rateBase: { fontFamily: "BasicBold", fontSize: 16 },
  arrow: { marginLeft: 6 },
});
