// app/(app)/(tabs)/dc/dc3.tsx

import ImageList, { ImageListData } from "@/components/organisms/ImageList";
import ItemCarousel from "@/components/organisms/ItemCarousel";
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import axios from "axios";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function Dc3() {
  const [top3, setTop3] = useState<ImageListData[]>([]);
  const [rest, setRest] = useState<ImageListData[]>([]);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchRecommend = async () => {
      try {
        const res = await axios.get(`${API_URL}/recommend/product`, {
          headers: {
            Authorization: `A103 ${accessToken}`,
          },
        });
        console.log("추천상품 응답:", res.data);

        // 예시 응답 구조: [{ productName, companyName, finalProfitRate, type }]
        const mapped: ImageListData[] = res.data.map((it: any) => ({
          logo:
            it.type === "BOND"
              ? require("@/assets/icon/bond.png")
              : require("@/assets/icon/etf.png"),
          title: it.productName,
          subTitle: it.companyName,
          rate: it.finalProfitRate ?? 0,
        }));

        setTop3(mapped.slice(0, 3));
        setRest(mapped.slice(3));
      } catch (err: any) {
        console.error("추천상품 불러오기 실패:", err.response?.status, err.message);
      }
    };

    fetchRecommend();
  }, [accessToken]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors?.back ?? "#F4F6FF" }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* ===== Header ===== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitleLine1}>당신을 위한</Text>
            <Text style={styles.headerTitleLine2}>알키의 상품 추천</Text>
          </View>
          <Image
            source={require("@/assets/icon/search.png")}
            style={styles.headerIcon}
          />
        </View>

        {/* ===== Carousel (Top3) ===== */}
        <View style={styles.carouselTrack}>
          <ItemCarousel items={top3} />
          <Text style={styles.caption}>대표 수익률은 3개월 기준입니다.</Text>
        </View>

        <ImageList
          items={rest}
          header="추천 상품"
          emptyText="추천 가능한 상품이 없습니다."
          initialCount={5}
          step={5}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = 260;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  /* Header */
  header: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  headerTitleLine1: { fontSize: 24, fontFamily: "BasicBold", color: Colors?.black ?? "#111" },
  headerTitleLine2: { fontSize: 24, fontFamily: "BasicBold", color: Colors?.black ?? "#111" },
  headerIcon: { width: 44, height: 44, resizeMode: "contain", marginTop: 4 },

  /* Carousel */
  carouselTrack: {
    paddingVertical: 8,
    columnGap: 18,
    paddingHorizontal: 6,
  },
  card: {
    width: CARD_W,
    height: 220,
    borderRadius: 20,
    padding: 18,
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardEmph: {
    backgroundColor: "#BFD1FF",
    transform: [{ translateY: -8 }],
  },
  cardTitle: { fontFamily: "BasicBold", fontSize: 18, color: "#111" },
  cardTitleDark: { fontFamily: "BasicBold", fontSize: 18, color: "#111" },
  cardRateUp: { marginTop: 8, fontFamily: "BasicBold", fontSize: 18, color: "#FF2C2C" },
  cardRateUpDark: { marginTop: 8, fontFamily: "BasicBold", fontSize: 18, color: "#FF2C2C" },
  cardBadge: {
    width: 64, height: 64, resizeMode: "contain",
    position: "absolute", right: 18, bottom: 18,
  },
  caption: {
    textAlign: "center",
    color: Colors?.gray ?? "#8B8B8B",
    fontFamily: "BasicMedium",
    fontSize: 12,
    marginBottom: 10,
  },
  /* List */
  list: {
    backgroundColor: Colors?.white ?? "#FFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  logoStub: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: "#FFF",
    alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  logoTxt: { fontFamily: "BasicBold", fontSize: 22, color: "#20140D" },
  rowCenter: { flex: 1 },
  rowTitle: { fontFamily: "BasicMedium", fontSize: 18, color: "#111" },
  rowSub: { fontFamily: "BasicMedium", fontSize: 12, color: "#9AA0A6", marginTop: 4 },
  rowRateUp: { fontFamily: "BasicBold", fontSize: 18, color: "#FF2C2C" },
  rowRateDown: { fontFamily: "BasicBold", fontSize: 18, color: "#2F6FFF" },
  divider: { height: 1, backgroundColor: "#E8EBF1" },
});
