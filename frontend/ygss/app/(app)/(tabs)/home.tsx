// app/(app)/(tabs)/home.tsx
import MyMoney from "@/components/molecules/MyMoney";
import ImageList, { ImageListData } from "@/components/organisms/ImageList";
import { fetchPlanDc } from "@/src/api/plan";
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [planItems, setPlanItems] = useState<ImageListData[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const screenW = Dimensions.get("window").width;

  // 마운트/토큰 변경 시 로드
  useEffect(() => {
    if (!accessToken) return; // 로그인 안됐으면 스킵(원하면 로그인 유도 메시지 표시 가능)

    (async () => {
      try {
        setLoadingPlan(true);
        setPlanError(null);
        const list = await fetchPlanDc(accessToken);
        setPlanItems(list);
      } catch (err: any) {
        const status = err?.response?.status;
        setPlanError(status ? `로드 실패 (HTTP ${status})` : "네트워크 오류");
        console.error("top 찜상품 load error:", status ?? err?.message);
      } finally {
        setLoadingPlan(false);
      }
    })();
  }, [accessToken]);


  return (
    <>
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
                똑똑하게{"\n"}퇴직연금 챙기기
              </Text>

            </View>
            <Image
              source={require("@/assets/char/basicAlchi.png")}
              style={styles.alchie}
              resizeMode="contain"
            />
          </View>

          {/* === 큰 비교 카드 (bigCard) === */}
          <View style={styles.cardContainer}>
            <TouchableOpacity
              onPress={() => router.push("/dc/dc4")}
              style={[styles.card, styles.bigCard]}
              activeOpacity={0.9}
            >
              <Text style={styles.boxTitle}>DB/DC 어떤 걸 선택할까?</Text>
              <Text style={styles.boxDesc}>연금술사의 예측 모델로 {"\n"}두 가지를 모두 비교해 보세요!</Text>
              <Image
                source={require("@/assets/icon/chart.png")}
                style={styles.boxIcon}
              />
            </TouchableOpacity>

            {/* === 두 개 추천 카드 === */}
            <View style={styles.row}>
              {/* DC 카드 */}
              <TouchableOpacity
                onPress={() => router.push("/dc/dc1")}
                style={[styles.card, styles.squareCard]}
                activeOpacity={0.9}
              >
                <Text style={[styles.boxTitle, styles.boxTitleLight]}>
                  맞춤형 DC 상품
                </Text>
                <Text style={[styles.boxDesc, styles.boxDescLight]}>
                  나에게 꼭 맞는 {"\n"}DC 상품은?
                </Text>
                <Image
                  source={require("@/assets/icon/board.png")}
                  style={styles.boxIcon}
                />
              </TouchableOpacity>

              {/* IRP 카드 */}
              <TouchableOpacity
                onPress={() => router.push("/irp/irp4")}
                style={[styles.card, styles.squareCard, styles.cardRight]}
                activeOpacity={0.9}
              >
                <Text style={styles.boxTitle}>IRP 계좌 추천</Text>
                <Text style={styles.boxDesc}>노후자금을{"\n"}더 든든하게!</Text>
                <Image
                  source={require("@/assets/icon/pig.png")}
                  style={styles.boxIcon}
                />
              </TouchableOpacity>
            </View>

          </View>

          {/* DC 상품 Top3 */}
          <View style={styles.topList}>
            {loadingPlan ? (
              <Text style={{ padding: 16, color: Colors.gray }}>불러오는 중…</Text>
            ) : planError ? (
              <Text style={{ padding: 16, color: "red" }}>{planError}</Text>
            ) : (
              <ImageList header="찜 상품 인기 순위" items={planItems} initialCount={3} step={5} />
            )}
          </View>

          <View style={styles.myInfo}>
            {/* 내 자산 현황 */}
            {user?.totalRetirePension != null && user?.totalRetirePension != undefined && (
              <View style={styles.moneyContainer}>
                  <MyMoney
                    amount={user.totalRetirePension}
                    rate={0} // TODO: 실제 수익률 값으로 교체 필요
                  />
              </View>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const SHADOW = Platform.select({
  ios: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  android: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
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
  cardContainer: {
    marginTop: 16,
    marginBottom: 20,
  },

  /* 헤더 */
  hero: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  heroLeft: {
    flex: 1,
    paddingTop: 8,
    alignItems: "flex-start",
  },
  logo: {
    height: 100,
    aspectRatio: 4,
    marginBottom: 6,
    alignSelf: "center",
  },
  heroTitle: {
    fontFamily: "BasicBold",
    fontSize: 24,
    color: "#111",
    lineHeight: 32,
    alignSelf: "flex-start",
    textAlign: "left",
    flexWrap: "nowrap",
    marginLeft: 8,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
  alchie: {
    width: 150,
    height: 150,
    marginLeft: 8,
  },

  /* 카드 공통 */
  card: {
    borderRadius: 16,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#fff",
    ...SHADOW,
  },
  boxTitle: { fontFamily: "BasicBold", fontSize: 18, marginBottom: 6 },
  boxTitleLight: { color: "#fff" },
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

  /* bigCard */
  bigCard: {
    minHeight: 130,
    marginTop: 14,
    marginBottom: 14,
  },

  /* 두 개 카드 */
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  squareCard: {
    flex: 1,
    height: 140,
    justifyContent: "space-between",
    backgroundColor: Colors?.primary,
  },
  cardRight: {
    marginLeft: 12,
    backgroundColor: Colors?.white,
  },

  divider: {
    height: 4,
    marginHorizontal: -20,
    backgroundColor: Colors?.white,
    marginTop: 8,
    marginBottom: 12,
  },

  sectionTitle: {
    fontFamily: "BasicBold",
    fontSize: 18,
    color: "#111",
    marginLeft: 8,
    marginBottom: 12,
  },

  listItem: {
    height: 58,
    borderBottomWidth: 1,
    borderColor: "#EFEFEF",
    marginBottom: 6,
  },

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
  smallLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EAEAEA",
  },

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
  topList: {
    marginHorizontal: -20,
    backgroundColor: Colors?.white,
    paddingVertical: 12,
    marginBottom: 16,
  },
  myInfo: {
    marginHorizontal: -20,
    backgroundColor: Colors?.white,
  },
  moneyContainer: {
    marginBottom: 10,
    paddingHorizontal: 16,
  },
});
