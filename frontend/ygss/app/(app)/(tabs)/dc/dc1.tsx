// app/(app)/(tabs)/dc/dc1.tsx

import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/src/theme/colors";

export default function Dc1() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        <View style={styles.topContainer}>
            {/* 왼쪽 6 */}
            <View style={styles.colLeft}>
            <TouchableOpacity
                style={[styles.box, styles.boxLeft]}
                onPress={() => router.push("/dc/dc2")}
                activeOpacity={0.9}
            >
                <Text style={[styles.boxTitle, styles.boxTitleLight]}>맞춤형 DC 상품</Text>
                <Text style={[styles.boxDesc, styles.boxDescLight]}>
                알키가 당신에게 꼭 맞는{"\n"}DC 상품을 추천해드려요!
                </Text>
                <Image source={require("@/assets/icon/bills.png")} style={styles.boxIcon} />
            </TouchableOpacity>
            </View>

            {/* 오른쪽 4 */}
            <View style={styles.colRight}>
            <TouchableOpacity
                style={[styles.box, styles.boxRight]}
                onPress={() => router.push("/dc/dc4")}
                activeOpacity={0.9}
            >
                <Text style={[styles.boxTitle, { color: Colors?.black ?? "#111" }]}>DB / DC</Text>
                <Text style={[styles.boxDesc, { color: Colors?.black ?? "#333" }]}>어떤 걸 선택할까?</Text>
                <Image source={require("@/assets/icon/chart.png")} style={styles.boxIcon} />
            </TouchableOpacity>
            </View>
        </View>

        {/* 알키 설명 박스 */}
        <View style={styles.explainBox}>
            <View style={styles.alchiBox}>
            <Image
                source={require("@/assets/char/winkAlchi.png")}
                style={styles.alchiIcon}
            />
            </View>
        </View>

        {/* 리스트 영역 */}
        <View style={styles.listContainer} />
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors?.back ?? "#F4F6FF",
  },
  container: {
    flex: 1,
    backgroundColor: Colors?.back ?? "#F4F6FF",
    padding: 20,
  },
  topContainer: {
    flexDirection: "row",
    columnGap: 14,         // gap 이슈 피해서 columnGap 사용 (지원됨)
    flexWrap: "nowrap",
    alignItems: "stretch",
    marginTop: 30,
  },
  // ← 비율은 래퍼에게
  colLeft: { flex: 6 },
  colRight: { flex: 4 },

  // 카드 자체는 래퍼 너비를 100%로 채움
  box: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  boxLeft: { backgroundColor: Colors?.primary ?? "#4666FF" },
  boxRight: { backgroundColor: Colors?.white ?? "#FFFFFF" },

  boxTitle: { fontFamily: "BasicBold", fontSize: 18, marginBottom: 6 },
  boxTitleLight: { color: "#FFFFFF" },
  boxDesc: { fontFamily: "BasicMedium", fontSize: 12, lineHeight: 18 },
  boxDescLight: { color: "rgba(255,255,255,0.9)" },
  boxIcon: {
    width: 56,
    height: 56,
    position: "absolute",
    right: 12,
    bottom: 12,
    resizeMode: "contain",
  },
  // 알키 설명 박스
  explainBox: {
    height: 600,
    padding: 20,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  alchiBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  alchiIcon: {
    width: 240,
    height: 240,
    resizeMode: "contain",
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
    backgroundColor: Colors?.white ?? "#FFFFFF",
    borderRadius: 16,
  },
});
