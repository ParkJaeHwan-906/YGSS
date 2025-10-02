// app/(app)/(tabs)/home.tsx
import MyMoney from "@/components/molecules/MyMoney";
import CustomAlert from "@/components/organisms/CustomAlert";
import ImageList, { ImageListData } from "@/components/organisms/ImageList";
import { fetchPlanDc } from "@/src/api/plan";
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiImage, MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Easing } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// 알키 이미지 매핑
const ALCHI_IMAGES = [
  require("@/assets/char/safeAlchi.png"),
  require("@/assets/char/verysafeAlchi.png"),
  require("@/assets/char/nuetralAlchi.png"),
  require("@/assets/char/dangerAlchi.png"),
  require("@/assets/char/verydangerAlchi.png"),
];

// 변경 속도
const PULSE_MS = 2000;

export default function Home() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);

  // 말풍선 멘트
  const INVEST_LINES = [
    "내 투자 MBTI 는 뭘까?",
    "30초 테스트로, 추천 정확도 UP!",
    "나에게 맞는 상품, 성향부터!",
  ];
  const [lineIdx, setLineIdx] = useState(0);

  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [planItems, setPlanItems] = useState<ImageListData[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const screenW = Dimensions.get("window").width;

  // 마운트/토큰 변경 시 로드
  useEffect(() => {
    if (!accessToken) return; // 로그인 안됐으면 스킵(원하면 로그인 유도 메시지 표시 가능)

    const fetchData = async () => {
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
    };

    fetchData();

    // cleanup 필요 없으면 생략 가능
    return () => { };
  }, [accessToken])

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((p) => (p + 1) % ALCHI_IMAGES.length);
      setTick((t) => t + 1); // 펄스 재시작을 위해 key 변경
    }, PULSE_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setLineIdx((p) => (p + 1) % INVEST_LINES.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);


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

          {/* === 로그인 상태가 아니라면 로그인 버튼 표시 === */}
          {user ? null : (
            <Pressable onPress={() => router.push("/login")} style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
              <Text style={{ fontSize: 16, fontFamily: "BasicMedium", marginRight: 8, color: Colors.primary }}>로그인</Text>
              <Ionicons name="log-in-outline" size={30} color={Colors.primary} />
            </Pressable>
          )}

          {/* 알키 이미지 매핑 */}
          <View style={styles.mainContainer}>
            {/* 배경 */}
            <MotiView
              key={`pulse-${tick}`}
              from={{ scale: 0.9, opacity: 0.45 }}
              animate={{ scale: 1.25, opacity: 0.12 }}
              transition={{
                type: "timing",
                duration: PULSE_MS,
                easing: Easing.inOut(Easing.ease),
              }}
              style={styles.bouncyCircle}
            />

            {/* 캐릭터 */}
            <MotiImage
              key={`alchi-${index}`}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 700 }}
              source={ALCHI_IMAGES[index]}
              style={styles.mainAlchi}
              resizeMode="contain"
            />

            {/* 말풍선 (멘트 순환) */}
            <MotiView
              key={`line-${lineIdx}`}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400 }}
              style={styles.bubbleWrap}
            >
              <Text style={styles.bubbleText}>{INVEST_LINES[lineIdx]}</Text>
              <View style={styles.bubbleTailOutline} />
              <View style={styles.bubbleTail} />
            </MotiView>

            {/* CTA 버튼 (펄스 + 프레스 스케일) */}
            <Pressable
              onPress={() => router.push("/(app)/invest")}
              style={({ pressed }) => [
                styles.ctaBtn,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
              android_ripple={{ color: Colors.back }}
            >
              <MotiView
                from={{ opacity: 0.4, scale: 1 }}
                animate={{ opacity: 0, scale: 1.2 }}
                transition={{ type: "timing", duration: 1400, loop: true }}
                style={styles.ctaPulse}
              />
              <Text style={styles.ctaText}>투자 성향 테스트 시작하기</Text>
              <Ionicons name="arrow-forward-circle" size={20} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.cardContainer}>
            {/* === 큰 비교 카드 (bigCard) === */}
            <TouchableOpacity
              onPress={() => {
                if (user) {
                  router.push("/dc/dc4");
                } else {
                  setAlertVisible(true);
                }
              }}
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

            <View style={styles.divider} />

            {/* === 두 개 추천 카드 === */}
            <View style={styles.row}>
              {/* DC 카드 */}
              {/* 사용자가 있으면 push 없으면 alert */}
              <TouchableOpacity
                onPress={() => {
                  if (user) {
                    router.push("/dc/dc2");
                  } else {
                    setAlertVisible(true);
                  }
                }}
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
                onPress={() => {
                  if (user) {
                    router.push("/irp/irp4");
                  } else {
                    setAlertVisible(true);
                  }
                }}
                style={[styles.card, styles.squareCard, styles.cardRight]}
                activeOpacity={0.9}
              >
                <Text style={styles.boxTitle}>IRP 예상 수익률</Text>
                <Text style={styles.boxDesc}>노후자금을{"\n"}더 든든하게!</Text>
                <Image
                  source={require("@/assets/icon/pig.png")}
                  style={styles.boxIcon}
                />
              </TouchableOpacity>
            </View>

          </View>

          {/* 찜상품 top 9 */}
          <View style={styles.topList}>
            {loadingPlan ? (
              <Text style={{ padding: 16, color: Colors.gray }}>불러오는 중…</Text>
            ) : planError ? (
              <Text style={{ padding: 16, color: "red" }}>{planError}</Text>
            ) : (
              <ImageList header="찜 상품 인기 순위" items={planItems} initialCount={3} step={5} />
            )}
          </View>

          <Pressable onPress={() => router.push("/mypage")}>
            {/* 내 자산 현황 */}
            <View style={styles.moneyContainer}>
              {user?.totalRetirePension !== null && user?.totalRetirePension !== undefined && (
                <MyMoney
                  amount={user.totalRetirePension}
                  from="home"
                  wrapHeight={140}
                  fontSize={16}
                  gap={-8}
                // rate={0} // TODO: 실제 수익률 값으로 교체 필요
                />
              )}
            </View>
          </Pressable>

          {/* 로그인 필요 alert */}
          <CustomAlert
            visible={alertVisible}
            title="로그인이 필요합니다"
            message="로그인 후 이용해주세요"
            onClose={() => setAlertVisible(false)}
          />
          {/* 포트폴리오 구성 */}
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
    gap: 40,
    marginTop: 40,
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
    marginBottom: -6,
    alignSelf: "center",
  },
  heroTitle: {
    fontFamily: "BasicBold",
    fontSize: 18,
    color: "#111",
    lineHeight: 22,
    alignSelf: "flex-start",
    textAlign: "left",
    flexWrap: "nowrap",
    marginLeft: 14,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
  mainContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    position: "relative",
    overflow: "visible",
  },
  bouncyCircle: {
    position: "absolute",
    top: 16,
    width: 260,
    height: 260,
    borderRadius: 140,
    zIndex: 0,
    backgroundColor: Colors.primary,
  },
  mainAlchi: {
    width: 220,
    height: 220,
    marginTop: 8,
    marginBottom: 8,
    resizeMode: "contain",
    alignSelf: "center",
    zIndex: 1,
  },
  bubbleWrap: {
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
    maxWidth: 280,
    position: "relative",
  },
  bubbleText: {
    fontFamily: "BasicMedium",
    fontSize: 14,
    color: "#222",
    lineHeight: 20,
    textAlign: "center",
  },

  /* ▼ 회전사각형(기존 bubbleTail) 삭제하고 아래 두 개로 대체 */
  bubbleTailOutline: {
    position: "absolute",
    bottom: -7,
    left: "50%",
    transform: [{ translateX: -8 }],
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  bubbleTailFill: {
    position: "absolute",
    bottom: -6,
    left: "50%",
    transform: [{ translateX: -7 }],
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fff",
  },
  bubbleTail: {
    position: "absolute",
    bottom: -6,                 // 채움이 1px 위
    left: "50%",
    transform: [{ translateX: -7 }],  // 좌우폭 14px 삼각형의 중앙(-7)
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fff",     // 말풍선 배경색과 동일
  },

  // CTA 버튼
  ctaBtn: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    color: "#fff",
    fontFamily: "BasicBold",
    fontSize: 14,
  },
  // 펄스 레이어 (버튼 아래 깔리는 잔광)
  ctaPulse: {
    position: "absolute",
    inset: 0,
    borderRadius: 999,
    backgroundColor: "#fff",
  },

  alchie: {
    width: 150,
    height: 150,
    marginTop: 8,
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
    marginTop: -6,
    marginBottom: 14,
  },

  /* 두 개 카드 */
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  squareCard: {
    flex: 1,
    height: 130,
    justifyContent: "space-between",
    backgroundColor: Colors?.primary,
    marginBottom: -20,
  },
  cardRight: {
    marginLeft: 12,
    backgroundColor: Colors?.white,
  },

  divider: {
    height: 8,
    marginHorizontal: -20,
    backgroundColor: Colors?.white,
    marginTop: -10,
    marginBottom: -10,
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
    marginBottom: 6,
  },
  moneyContainer: {
    marginBottom: 0,
    // paddingHorizontal: -10,
  },
});
