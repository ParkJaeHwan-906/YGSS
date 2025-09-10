import { View, Text, StyleSheet, Image } from "react-native";
import { Colors } from "@/src/theme/colors";

type DictProps = {
  title: string;
  desc: string;
};

export default function Dict({ title, desc }: DictProps) {
  return (
    <View style={styles.card}>
      {/* 아이콘 + 고정 텍스트 */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/icon/chat.png")} // 아이콘 png 넣어주세요
          style={styles.icon}
        />
        <Text style={styles.headerText}>연금술사 용어사전</Text>
      </View>

      {/* 제목 */}
      <Text style={styles.title}>{title}</Text>

      {/* 설명 */}
      <Text style={styles.desc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors?.white ?? "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    marginRight: 8,
  },
  headerText: {
    fontFamily: "BasicMedium",
    fontSize: 14,
    color: Colors?.black ?? "#111",
  },
  title: {
    fontFamily: "BasicBold",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
    color: Colors?.black ?? "#111",
  },
  desc: {
    fontFamily: "BasicLight",
    fontSize: 14,
    lineHeight: 20,
    color: Colors?.black ?? "#333",
  },
});
