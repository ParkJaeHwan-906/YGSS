// app/(app)/(tabs)/dc/dc3.tsx

import ImageList, { ImageListData } from "@/components/organisms/ImageList";
import ItemCarousel from "@/components/organisms/ItemCarousel";
import { Colors } from "@/src/theme/colors";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dc3() {
  const { data } = useLocalSearchParams<{ data?: string }>();

  const { top3, rest } = useMemo(() => {
    if (!data) return { top3: [], rest: [] };
    try {
      const { productList, top3 } = JSON.parse(data);

      const mapped: ImageListData[] = productList.map((it: any) => ({
        id: it.id,
        logo:
          it.productType === "BOND"
            ? require("@/assets/icon/bond.png")
            : it.productType === "펀드"
              ? require("@/assets/icon/fund.png")
              : require("@/assets/icon/etf.png"),
        title: it.product,
        subTitle: it.company,
        rate: it.profitPrediction ?? 0,
        type: it.productType,
      }));

      const mappedTop3: ImageListData[] = top3.map((it: any) => ({
        id: it.id,
        logo:
          it.productType === "BOND"
            ? require("@/assets/icon/bond.png")
            : it.productType === "펀드"
              ? require("@/assets/icon/fund.png")
              : require("@/assets/icon/etf.png"),
        title: it.product,
        subTitle: it.company,
        rate: it.profitPrediction ?? 0,
        type: it.productType,
      }));

      return {
        top3: mappedTop3,
        rest: mapped.slice(3),
      };
    } catch (err) {
      console.error("추천상품 데이터 파싱 실패:", err);
      return { top3: [], rest: [] };
    }
  }, [data]); 6


  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors?.back ?? "#F4F6FF" }]} edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 0 }} >
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
          initialCount={3}
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
  headerTitleLine1: {
    fontSize: 24,
    fontFamily: "BasicBold",
    color: Colors?.black ?? "#111",
  },
  headerTitleLine2: {
    fontSize: 24,
    fontFamily: "BasicBold",
    color: Colors?.black ?? "#111",
  },
  headerIcon: { width: 44, height: 44, resizeMode: "contain", marginTop: 4 },

  /* Carousel */
  carouselTrack: {
    paddingVertical: 8,
    columnGap: 18,
    paddingHorizontal: 6,
  },
  caption: {
    textAlign: "center",
    color: Colors?.gray ?? "#8B8B8B",
    fontFamily: "BasicMedium",
    fontSize: 12,
    marginBottom: 10,
  },
});