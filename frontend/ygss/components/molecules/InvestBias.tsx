import { Colors } from "@/src/theme/colors";
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function InvestBias() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[
        styles.box,
        { backgroundColor: '#FFFCA8' },
      ]}
      activeOpacity={0.9}
      onPress={() => router.push("/(app)/invest")}
    >
      <Text
        style={[
          styles.boxTitle,
          styles.textLight,
        ]}
      >
        나는 어떤 투자 성향일까?
      </Text>
      <Text
        style={[
          styles.boxDesc,
          styles.textLightSub,
        ]}
      >
        투자 성향을 검사하고, {"\n"} 나만의 투자 전략을 추천해드려요!
      </Text>
      <Image source={require("@/assets/icon/paper.png")} style={styles.boxIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
    position: "relative",
  },
  boxTitle: { fontFamily: "BasicBold", fontSize: 18, marginBottom: 6 },
  boxDesc: { fontFamily: "BasicMedium", fontSize: 12, lineHeight: 18 },
  textLight: { color: Colors?.black ?? "#111" },
  textLightSub: { color: "#6F6F6F" },
  boxIcon: {
    width: 60,
    height: 60,
    position: "absolute",
    right: 12,
    bottom: 12,
    resizeMode: "contain",
  },
});
