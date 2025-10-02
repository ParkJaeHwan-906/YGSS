import { View, Text, StyleSheet, Image, ViewStyle } from "react-native";
import { Colors } from "@/src/theme/colors";

type DictProps = {
  title: string;
  desc: string;
  style?: ViewStyle;
};

export default function Dict({ title, desc, style }: DictProps) {
  return (
    <View style={[styles.card, style]}>
      {/* 헤더: 아이콘 + 라벨 + 타이틀 */}
      <View style={styles.headerLine}>
        <Image
          source={require("@/assets/icon/chat.png")}
          style={styles.icon}
        />
        <Text style={styles.headerLabel}>연금술사 용어사전:</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* 설명 */}
      <Text style={styles.desc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors?.white ?? "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 40,
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  headerLine: {
    flexDirection: "row",     // 아이콘 + 텍스트 가로 배치
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    marginRight: 8,           // 아이콘 ↔ 라벨 사이 여백
  },
  headerLabel: {
    fontFamily: "BasicMedium",
    fontSize: 14,
    color: Colors?.black ?? "#111",
    marginRight: 6,           // 라벨 ↔ 타이틀 사이 여백
  },
  headerTitle: {
    fontFamily: "BasicBold",
    fontSize: 14,
    color: Colors?.primary ?? "#4666FF",
  },
  desc: {
    fontFamily: "BasicMedium",
    fontSize: 12,
    lineHeight: 20,
    color: Colors?.black ?? "#333",
  },
});
