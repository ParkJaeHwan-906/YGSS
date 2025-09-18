// app/(app)/(tabs)/home.tsx
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import { Link, useRouter } from "expo-router";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <SafeAreaView style={styles.background} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" translucent={false} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: 8 }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* === 헤더 === */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Image
              source={require("@/assets/icon/titleLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.heroTitle}>
              똑똑하게{"\n"}퇴직연금 챙기기!
            </Text>
          </View>
          <Image
            source={require("@/assets/char/basicAlchi.png")}
            style={styles.alchie}
            resizeMode="contain"
          />
        </View>

        {/* 이하 섹션들 동일 */}
        <View style={[styles.card, styles.bigCard]}>
          <View style={{ flex: 1 }}>
            <View style={styles.captionPill} />
            <View style={{ height: 12 }} />
            <View style={styles.h2Line} />
            <View style={{ height: 8 }} />
            <View style={[styles.smallLine, { width: "70%" }]} />
          </View>
          <View style={styles.rightIconPlaceholder} />
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.squareCard]}>
            <View style={[styles.smallLine, { width: "55%" }]} />
            <View style={[styles.smallLine, { width: "45%", marginTop: 6 }]} />
            <View style={styles.bottomEmojiPlaceholder} />
          </View>
          <View style={[styles.card, styles.squareCard, styles.cardRight]}>
            <View style={[styles.smallLine, { width: "55%" }]} />
            <View style={[styles.smallLine, { width: "45%", marginTop: 6 }]} />
            <View style={styles.bottomEmojiPlaceholder} />
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>DC 상품 Top3</Text>
        <Link href="/(app)/(tabs)/component">컴포넌트</Link>
        <View style={styles.listItem} />
        <View style={styles.listItem} />
        <View style={styles.listItem} />

        <View style={[styles.divider, { marginTop: 8 }]} />

        <Text style={styles.sectionTitle}>내 자산 운용 현황</Text>

        <View style={styles.statsRow}>
          <View style={styles.leftStatIcon} />
          <View style={styles.rightStatBox} />
        </View>

        <View style={styles.centerNumberBlock}>
          <View style={[styles.bigNumberLine, { width: "80%" }]} />
          <View
            style={[
              styles.smallLine,
              { width: "70%", marginTop: 10, opacity: 0.7 },
            ]}
          />
        </View>

        <View style={[styles.card, styles.donutCard]}>
          <View style={styles.donutPlaceholder} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  android: { elevation: 3 },
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors?.back ?? "#F3F5FF",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  /* 헤더 */
  hero: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  heroLeft: {
    flex: 1,
    paddingTop: 8,
    alignItems: "flex-start", // ✅ 좌측 정렬 기준 고정
  },
  logo: {
    height: 100,
    aspectRatio: 4, // 로고 비율 맞춤
    marginBottom: 6,
    alignSelf: "center"
  },
  heroTitle: {
    fontFamily: "BasicBold",
    fontSize: 24,
    color: "#111",
    lineHeight: 32,
    alignSelf: "flex-start",
    textAlign: "left",
    marginLeft: 8,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}), // ✅ 안드로이드 여백 제거
  },
  alchie: {
    width: 150,
    height: 150,
    marginLeft: 8,
  },

  /* 카드 공통 */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    ...SHADOW,
  },

  /* 큰 비교 카드 */
  bigCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 110,
    marginTop: 14,
    marginBottom: 12,
  },
  captionPill: {
    width: 96,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E8EDFF",
  },
  h2Line: {
    width: "72%",
    height: 20,
    borderRadius: 4,
    backgroundColor: "#D9E3FF",
  },
  smallLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EAEAEA",
  },
  rightIconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#EAF2FF",
    marginLeft: 14,
  },

  /* 두 개 추천 카드 */
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  squareCard: {
    flex: 1,
    height: 140,
    justifyContent: "space-between",
  },
  cardRight: { marginLeft: 12 },
  bottomEmojiPlaceholder: {
    alignSelf: "flex-end",
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#EFF4FF",
  },

  divider: {
    height: 10,
    marginHorizontal: -20,
    backgroundColor: "#E9ECF8",
    marginTop: 8,
    marginBottom: 12,
  },

  /* 섹션 타이틀 */
  sectionTitle: {
    fontFamily: "BasicBold",
    fontSize: 18,
    color: "#111",
    marginLeft: 8,
    marginBottom: 12,
  },

  /* 리스트(Top3) */
  listItem: {
    height: 58,
    borderBottomWidth: 1,
    borderColor: "#EFEFEF",
    marginBottom: 6,
  },

  /* 운용 현황 상단 */
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  leftStatIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EAF2FF",
  },
  rightStatBox: {
    flex: 1,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#FFECEF",
    marginLeft: 12,
  },

  /* 중앙 큰 숫자 블록 */
  centerNumberBlock: {
    alignItems: "center",
    marginTop: 2,
    marginBottom: 14,
  },
  bigNumberLine: {
    height: 34,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
  },

  /* 도넛 카드 */
  donutCard: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  donutPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 18,
    borderColor: "#DDEBFF",
    borderRightColor: "#B7D4FF",
    borderBottomColor: "#CFE1FF",
    borderLeftColor: "#EAF2FF",
  },
});
