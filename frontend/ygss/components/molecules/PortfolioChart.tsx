// components/PortfolioRatio.tsx
import { Colors } from "@/src/theme/colors";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Slice = { label: "ETF" | "펀드" | "채권"; amount: number; color?: string };

const ENTER_DURATION = 900;  // 최초 등장
const SWITCH_DURATION = 1100; // 초점 전환
const INTERVAL = 2800;

const toMan = (n: number) => Math.round(n / 10_000);
const fmtMan = (n: number) => new Intl.NumberFormat("ko-KR").format(toMan(n)) + "만원";

interface PortfolioRatioProps {
  slices?: Slice[];
}

export default function PortfolioRatio({ slices }: PortfolioRatioProps) {
  const palette = {
    ETF: "#8BB6FF",
    펀드: "#A8B7D1",
    채권: "#FFE9B7",
  } as const;

  const baseData = useMemo(
    () =>
      (slices ?? [
        { label: "ETF", amount: 6_000_000 },
        { label: "펀드", amount: 2_500_000 },
        { label: "채권", amount: 1_500_000 },
      ]).map((it) => ({ ...it, color: it.color ?? palette[it.label] })),
    [slices]
  );

  const total = baseData.reduce((a, c) => a + (c.amount || 0), 0) || 1;

  // 차트에 넣을 원본 값(금액 그대로)
  const chartBase = baseData.map((it) => ({
    value: it.amount,
    color: it.color!,
    label: it.label,
  }));

  const [focusedIndex, setFocusedIndex] = useState(0);
  const prevIndexRef = useRef(0);

  // 중앙 라벨용 진행도
  const labelProgress = useSharedValue(0);

  // 도넛 자체 펄스/웨이블 진행도
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    // 최초 등장 애니메이션
    labelProgress.value = withTiming(1, {
      duration: ENTER_DURATION,
      easing: Easing.inOut(Easing.cubic),
    });
    ringProgress.value = withTiming(1, {
      duration: ENTER_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    const id = setInterval(() => {
      prevIndexRef.current = focusedIndex;
      const next = (focusedIndex + 1) % baseData.length;
      setFocusedIndex(next);

      // 라벨 크로스페이드
      labelProgress.value = 0;
      labelProgress.value = withTiming(1, {
        duration: SWITCH_DURATION,
        easing: Easing.inOut(Easing.cubic),
      });

      // 도넛 펄스 + 살짝 회전 웨이블
      ringProgress.value = 0;
      ringProgress.value = withTiming(1, {
        duration: SWITCH_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    }, INTERVAL);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedIndex, baseData.length]);

  // 중앙 라벨 크로스페이드
  const prevIdx = prevIndexRef.current;
  const current = baseData[focusedIndex];
  const previous = baseData[prevIdx];

  const pct = (amt: number) => Math.round((amt / total) * 100);

  const currentStyle = useAnimatedStyle(() => ({
    opacity: labelProgress.value,
    transform: [{ scale: interpolate(labelProgress.value, [0, 1], [0.96, 1]) }],
  }));
  const prevStyle = useAnimatedStyle(() => ({
    opacity: 1 - labelProgress.value,
    transform: [{ scale: interpolate(labelProgress.value, [0, 1], [1, 0.98]) }],
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  }));

  // 도넛 펄스/웨이블: 반지름/내부반지름/회전값 보간
  const baseRadius = 85;
  const baseInner = 55;

  const animatedChartStyle = useAnimatedStyle(() => {
    // 0→1 구간에서 살짝 커졌다(1.0→1.04) 돌아오는 느낌
    const scale = interpolate(ringProgress.value, [0, 0.6, 1], [1, 1.04, 1]);
    const rotate = interpolate(ringProgress.value, [0, 0.5, 1], [0, 0.06, 0]); // 라디안
    return {
      transform: [{ rotateZ: `${rotate}rad` }, { scale }],
    };
  });

  // radius / innerRadius도 동시에 펄스
  const animatedRadius = useSharedValue(baseRadius);
  const animatedInner = useSharedValue(baseInner);

  // ringProgress 의 값으로 radius/innerRadius를 도출
  const radius = () =>
    interpolate(ringProgress.value, [0, 0.6, 1], [baseRadius, baseRadius + 6, baseRadius]);
  const innerRadius = () =>
    interpolate(ringProgress.value, [0, 0.6, 1], [baseInner, baseInner + 4, baseInner]);

  return (
    <View style={styles.card}>
      <View style={styles.chartWrapper}>
        <Animated.View style={animatedChartStyle}>
          <PieChart
            data={chartBase.map((it, i) => ({
              ...it,
              focused: i === focusedIndex,
            }))}
            donut
            radius={radius()}
            innerRadius={innerRadius()}
            strokeColor={Colors.white}
            strokeWidth={2}
            sectionAutoFocus
            showGradient
            labelsPosition="outward"
            centerLabelComponent={() => (
              <View
                style={{ width: 140, height: 60, alignItems: "center", justifyContent: "center" }}
              >
                {/* 이전 라벨 */}
                <Animated.View style={prevStyle}>
                  <Text style={styles.centerTitle}>{previous.label}</Text>
                  <Text style={styles.centerAmount}>{fmtMan(previous.amount)}</Text>
                  <Text style={styles.centerPct}>{pct(previous.amount)}%</Text>
                </Animated.View>

                {/* 현재 라벨 */}
                <Animated.View style={[{ alignItems: "center" }, currentStyle]}>
                  <Text style={styles.centerTitle}>{current.label}</Text>
                  <Text style={styles.centerAmount}>{fmtMan(current.amount)}</Text>
                  <Text style={styles.centerPct}>{pct(current.amount)}%</Text>
                </Animated.View>
              </View>
            )}
          />
        </Animated.View>
      </View>

      {/* 총합 (만원 단위) */}
      <Text style={styles.totalText}>총합: {fmtMan(total)}</Text>

      {/* 범례 (만원 단위) */}
      {/* <View style={styles.legendContainer}>
        {baseData.map((item, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.label}: {fmtMan(item.amount)} ({pct(item.amount)}%)
            </Text>
          </View>
        ))}
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors?.back ?? "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  centerTitle: { fontSize: 16, fontFamily: "BasicBold", color: Colors.black },
  centerAmount: { fontSize: 12, fontFamily: "BasicMedium", color: "#444", marginTop: 2 },
  centerPct: { fontSize: 11, fontFamily: "BasicMedium", color: "#8A8AA3", marginTop: 1 },
  totalText: {
    textAlign: "center",
    marginTop: 6,
    fontSize: 12,
    color: "#666",
    fontFamily: "BasicMedium",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 12,
    rowGap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 13, color: Colors?.black ?? "#111", fontFamily: "BasicMedium" },
});
