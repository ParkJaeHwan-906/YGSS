// app/(app)/invest/test.tsx
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import axios from "axios";
import { Colors } from "@/src/theme/colors";
import { usePathname } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiOption = { no: number; option: string; score: number };
type ApiQuestion = { no: number; question: string; options: ApiOption[] };

// 알키 이미지 매핑
const ALCHI_IMAGES = [
  require("@/assets/char/winkAlchi.png"),
  require("@/assets/char/dreamAlchi.png"),
  require("@/assets/char/sadAlchi.png"),
  require("@/assets/char/pointAlchi.png"),
  require("@/assets/char/upsetAlchi.png"),
];

const STAGGER = 70;       // 항목 간 지연(ms) - 공통
const EXIT_DUR = 220;     // 슬라이드 아웃 시간
const ENTER_DUR = 260;    // 슬라이드 인 시간

export default function InvestTest() {
  const router = useRouter();
  const pathname = usePathname();
  // 로그인 페이지와 동일 패턴: Redux에서 accessToken 사용
  const accessToken = useSelector((s: any) => s?.auth?.accessToken);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [idx, setIdx] = useState(0);                       // 현재 문항 인덱스
  const [answers, setAnswers] = useState<Record<number, number>>({}); // { [question.no]: option.no }
  const [selectedNo, setSelectedNo] = useState<number | null>(null);   // 현재 문항에서 누른 옵션 no

  // 질문번호 -> 랜덤 이미지 매핑
  const [imgMap, setImgMap] = useState<Record<number, number>>({});

  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!questions.length) return;
  
    // 연속 문항에서 같은 이미지가 나오지 않게 살짝 배려
    const map: Record<number, number> = {};
    let lastPicked = -1;
  
    for (const q of questions) {
      let pick = Math.floor(Math.random() * ALCHI_IMAGES.length);
      if (ALCHI_IMAGES.length > 1 && pick === lastPicked) {
        // 바로 이전과 같은 이미지면 하나 옆으로 밀기
        pick = (pick + 1) % ALCHI_IMAGES.length;
      }
      map[q.no] = pick;
      lastPicked = pick;
    }
    setImgMap(map);
  }, [questions]);

  // 총점
  const totalScore = useMemo(() => {
    return questions.reduce((sum, q) => {
      const selNo = answers[q.no];
      const opt = q.options.find(o => o.no === selNo);
      return sum + (opt?.score ?? 0);
    }, 0);
  }, [answers, questions]);

  // API 호출
  useEffect(() => {
    (async () => {
      try {
        if (!accessToken) {
          Alert.alert("로그인이 필요해요", "다시 로그인 후 시도해 주세요.");
          router.replace("/(auth)/login");
          return;
        }
        const { data } = await axios.get<ApiQuestion[]>(
          `${API_URL}/investor/personality/test`,
          { headers: { Authorization: `A103 ${accessToken}` } }
        );
        // 방어: 각 문항 옵션은 4개로 제한
        const normalized = (data ?? []).map(q => ({
          ...q,
          options: (q.options ?? []).slice(0, 4),
        }));
        setQuestions(normalized);
      } catch (err: any) {
        console.error("질문 로드 실패", err);
        Alert.alert("오류", "질문을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  // 옵션 선택 → 나머지 연하게 → 200ms 후 다음 문항 or 결과 이동
  const onSelect = (q: ApiQuestion, o: ApiOption) => {
    if (exiting) return;
    setSelectedNo(o.no);
    setAnswers(prev => ({ ...prev, [q.no]: o.no }));
    setExiting(true);
  
    const totalWait = (q.options.length - 1) * STAGGER + EXIT_DUR + 100;
  
    setTimeout(() => {
      if (idx >= questions.length - 1) {
        const finalScore = totalScore + (answers[q.no] ? 0 : o.score);
        router.push({ pathname: "/invest/loading", params: { score: String(finalScore) } });
        return;
      }
      setIdx(i => i + 1);
      setSelectedNo(null);
      setExiting(false);
    }, totalWait);
  };

  useEffect(() => {
    console.log("🧭 [test] path:", pathname);
    console.log("🔑 [test] accessToken 존재?", !!accessToken);
    console.log("🌐 [test] API_URL:", API_URL);
  }, [pathname, accessToken]);
  
  useEffect(() => {
    console.log("🧩 [test] questions loaded:", questions.length);
  }, [questions.length]);

  if (loading) {
    return (
      <>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={Colors?.primary ?? "#4666FF"} />
          <Text style={{ marginTop: 10, color: Colors?.gray }}>불러오는 중…</Text>
        </SafeAreaView>
      </>
    );
  }

  // 질문이 없을 때
  if (!questions.length) {
    return (
      <>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ color: Colors?.gray }}>질문 데이터가 없습니다.</Text>
        </SafeAreaView>
      </>
    );
  }

  const q = questions[idx];
  const stepText = `${idx + 1}/${questions.length}`;
  const safeImgIdx = (imgMap[q.no] ?? (q.no % ALCHI_IMAGES.length)) as number;

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView
        edges={["top", "bottom"]}
        style={[styles.safe, { backgroundColor: Colors?.white ?? "#EEF2FF" }]}
      >
        {/* titleLogo PNG 그대로 유지 */}
        <Image
          source={require("@/assets/icon/titleLogo.png")}
          style={styles.titleLogo}
          resizeMode="contain"
        />

        <View style={styles.container}>
          <View style={styles.questionWrap}>
            {/* 진행상황 Bar + 텍스트 */}
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((idx + 1) / questions.length) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.stepText}>{stepText}</Text>
            </View>

            <Image
              key={`hero-${q.no}`}
              source={ALCHI_IMAGES[safeImgIdx]}
              style={styles.hero}
              resizeMode="contain"
            />

            <Text key={`q-${q.no}`} style={styles.question}>
              Q{idx + 1}. {q.question}
            </Text>
          </View>

          {/* 옵션 4가지 (계단형 in/out 유지) */}
          <View key={`opts-${q.no}`}>
            {q.options.map((o, i) => {
              const active = selectedNo === o.no || answers[q.no] === o.no;
              const dimmed =
                (selectedNo !== null && selectedNo !== o.no) ||
                (answers[q.no] && answers[q.no] !== o.no);

              return (
                <Animated.View
                  key={`${q.no}-${o.no}`}
                  entering={SlideInRight.delay(STAGGER * i).duration(ENTER_DUR).springify().damping(16)}
                  exiting={SlideOutLeft.delay(STAGGER * i).duration(EXIT_DUR).springify().damping(16)}
                  style={{ width: "100%" }}
                >
                  <Pressable
                    disabled={exiting}
                    onPress={() => onSelect(q, o)}
                    style={({ pressed }) => [
                      styles.cta,
                      dimmed && styles.ctaDimmed,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ctaText,
                        dimmed && styles.ctaTextDim,
                        active && styles.ctaTextActive,
                      ]}
                    >
                      {o.option}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  titleLogo: {
    width: 140,
    height: 60,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  questionWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  // 진행바
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EDF1FF",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors?.primary ?? "#4666FF",
  },
  stepText: {
    fontSize: 14,
    fontFamily: "BasicMedium",
    color: Colors?.gray ?? "#8A8AA3",
  },

  hero: { width: 200, height: 200, marginBottom: 12 },
  question: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "BasicMedium",
    color: Colors?.black ?? "#121212",
    textAlign: "center",
  },

  // 옵션 버튼
  cta: {
    marginTop: 8,
    width: 300,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors?.primary ?? "#4666FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors?.primary ?? "#4666FF",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  ctaDimmed: { backgroundColor: "#BFC8FF" },
  ctaText: { fontFamily: "BasicBold", fontSize: 16, color: "#FFFFFF" },
  ctaTextDim: { color: "#F4F6FF" },
  ctaTextActive: { color: "#FFFFFF" },
});
