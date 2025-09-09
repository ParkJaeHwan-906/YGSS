// app/(app)/(tabs)/dc/dc3.tsx

import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/src/theme/colors";

export default function Dc3() {
  return (
    <SafeAreaView
      edges={['top','left','right']}                             // ✅ 상단/좌우 세이프엣지
      style={[styles.safeArea, { backgroundColor: Colors?.back ?? "#F4F6FF" }]}
    >
      {/* ✅ 상태바: 아이콘 보이게(시간/배터리), 배경은 투명 */}
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* ===== Header ===== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitleLine1}>당신을 위한</Text>
            <Text style={styles.headerTitleLine2}>알키의 상품 추천</Text>
          </View>
          <Image
            source={require("@/assets/icon/search.png")} // 없으면 임시로 다른 아이콘 사용
            style={styles.headerIcon}
          />
        </View>

        {/* ===== Carousel ===== */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          contentContainerStyle={styles.carouselTrack}
          decelerationRate="fast"
        >
          {/* 카드 1 */}
          <View style={[styles.card, { backgroundColor: "#FFF7A6" }]}>
            <Text style={styles.cardTitle}>하나증권{"\n"}DC 투자 상품</Text>
            <Text style={styles.cardRateUp}>+92.54%</Text>
            <Image source={require("@/assets/icon/star.png")} style={styles.cardBadge}/>
          </View>

          {/* 카드 2 (중앙 강조) */}
          <View style={[styles.card, styles.cardEmph]}>
            <Text style={styles.cardTitleDark}>하나증권{"\n"}DC 투자 상품</Text>
            <Text style={styles.cardRateUpDark}>+92.54%</Text>
            <Image source={require("@/assets/icon/star.png")} style={styles.cardBadge}/>
          </View>

          {/* 카드 3 */}
          <View style={[styles.card, { backgroundColor: "#FFF7A6" }]}>
            <Text style={styles.cardTitle}>하나증권{"\n"}DC 투자 상품</Text>
            <Text style={styles.cardRateUp}>+92.54%</Text>
            <Image source={require("@/assets/icon/star.png")} style={styles.cardBadge}/>
          </View>
        </ScrollView>

        {/* 캡션 */}
        <Text style={styles.caption}>대표 수익률은 3개월 기준입니다.</Text>

        {/* ===== Section: 더 많은 상품 확인하기 ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>더 많은 상품 확인하기</Text>
        </View>

        {/* 리스트 placeholder */}
        <View style={styles.list}>
          <View style={styles.row}>
            <View style={styles.logoStub}><Text style={styles.logoTxt}>let:</Text></View>
            <View style={styles.rowCenter}>
              <Text style={styles.rowTitle}>롯데손해보험</Text>
              <Text style={styles.rowSub}>롯데손해보험</Text>
            </View>
            <Text style={styles.rowRateUp}>+10.5%</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.logoStub}><Text style={styles.logoTxt}>let:</Text></View>
            <View style={styles.rowCenter}>
              <Text style={styles.rowTitle}>롯데손해보험</Text>
              <Text style={styles.rowSub}>롯데손해보험</Text>
            </View>
            <Text style={styles.rowRateUp}>+10.5%</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.logoStub}><Text style={styles.logoTxt}>let:</Text></View>
            <View style={styles.rowCenter}>
              <Text style={styles.rowTitle}>미국ETF</Text>
              <Text style={styles.rowSub}>롯데손해보험</Text>
            </View>
            <Text style={styles.rowRateDown}>-2.4%</Text>
          </View>

          {/* 아래 화살표 아이콘 영역(임시) */}
          <View style={{ alignItems: "center", paddingVertical: 12 }}>
            <Text style={{ fontSize: 18 }}>⌄</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = 260;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  /* Header */
  header: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
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
    marginTop: 14,
    marginBottom: 18,
  },

  /* Section */
  sectionHeader: { marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontFamily: "BasicBold", fontSize: 20, color: "#111" },

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
