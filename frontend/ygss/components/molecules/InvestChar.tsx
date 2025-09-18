import InvestBias from "@/components/molecules/InvestBias";
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  Animated as RNAnimated,
  Easing as RNEasing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type Slice = {
  label: "ETF" | "펀드" | "채권";
  amount: number; // 👉 count(개수)
  color?: string;
};

const ENTER_DURATION = 900;
const SWITCH_DURATION = 1100;
const INTERVAL = 2800;

interface InvestCharProps {
  slices?: Slice[];
}

export default function InvestChar({ slices }: InvestCharProps) {
  const user = useAppSelector((state) => state.auth.user);

  const userName = user?.name ?? "유저";
  const investType = user?.riskGrade ?? "?????";

  const [showBias, setShowBias] = useState(false);
  const translateY = useRef(new RNAnimated.Value(0)).current;
  const slide = useSharedValue(0);

  // 위아래로 화살표 애니메이션
  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(translateY, {
          toValue: 6,
          duration: 600,
          easing: RNEasing.inOut(RNEasing.quad),
          useNativeDriver: true,
        }),
        RNAnimated.timing(translateY, {
          toValue: 0,
          duration: 600,
          easing: RNEasing.inOut(RNEasing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateY]);

  // Bias 토글 애니메이션
  useEffect(() => {
    slide.value = withTiming(showBias ? 1 : 0, { duration: 300 });
  }, [showBias]);

  const biasStyle = useAnimatedStyle(() => ({
    opacity: slide.value,
    transform: [{ translateY: slide.value === 1 ? 0 : -20 }],
    height: slide.value === 1 ? "auto" : 0,
  }));

  // 투자 성향 미정일 때
  if (investType === "?????") {
    return (
      <View style={styles.card}>
        <Text style={styles.titleText}>
          {userName}님은{"\n"}
          <Text style={styles.highlight}>{investType}</Text> 입니다.
        </Text>
        <Image
          source={require("@/assets/char/pointAlchi.png")}
          style={styles.emptyIcon}
          resizeMode="contain"
        />
        <Text style={styles.emptyText}>투자 성향 테스트를 해보세요!</Text>

        <RNAnimated.View
          style={[{ transform: [{ translateY: translateY }] }, styles.arrowStyle]}
        >
          <Pressable onPress={() => setShowBias(!showBias)}>
            <Ionicons
              name={showBias ? "chevron-up-outline" : "chevron-down-outline"}
              size={24}
              color="black"
            />
          </Pressable>
        </RNAnimated.View>

        <Animated.View style={[{ overflow: "hidden" }, biasStyle]}>
          <InvestBias />
        </Animated.View>
      </View>
    );
  }

  const palette = {
    ETF: "#8BB6FF",
    펀드: "#A8B7D1",
    채권: "#FFE9B7",
  } as const;

  // slices 없으면 더미 데이터
  const baseData = useMemo(() => {
    if (!slices || slices.length === 0) {
      // 🔹 아무것도 찜 안했을 경우 → 회색 1개
      return [{ label: "없음" as any, amount: 1, color: "#D3D3D3" }];
    }

    return slices.map((it) => ({
      ...it,
      color: it.color ?? palette[it.label],
    }));
  }, [slices]);

  if (baseData.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>찜한 상품이 없습니다.</Text>
      </View>
    );
  }

  const total = baseData.reduce((a, c) => a + (c.amount || 0), 0) || 1;
  const pct = (amt: number) => Math.round((amt / total) * 100);

  const chartBase = baseData.map((it) => ({
    value: it.amount,
    color: it.color!,
    label: it.label,
  }));

  const [focusedIndex, setFocusedIndex] = useState(0);
  const prevIndexRef = useRef(0);

  const labelProgress = useSharedValue(0);
  const ringProgress = useSharedValue(0);

  useEffect(() => {
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

      labelProgress.value = 0;
      labelProgress.value = withTiming(1, {
        duration: SWITCH_DURATION,
        easing: Easing.inOut(Easing.cubic),
      });

      ringProgress.value = 0;
      ringProgress.value = withTiming(1, {
        duration: SWITCH_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    }, INTERVAL);

    return () => clearInterval(id);
  }, [focusedIndex, baseData.length]);

  const prevIdx = prevIndexRef.current;
  const current = baseData[focusedIndex];
  const previous = baseData[prevIdx];

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

  const baseRadius = 85;
  const baseInner = 55;

  const animatedChartStyle = useAnimatedStyle(() => {
    const scale = interpolate(ringProgress.value, [0, 0.6, 1], [1, 1.04, 1]);
    const rotate = interpolate(ringProgress.value, [0, 0.5, 1], [0, 0.06, 0]);
    return {
      transform: [{ rotateZ: `${rotate}rad` }, { scale }],
    };
  });

  const radius = () =>
    interpolate(ringProgress.value, [0, 0.6, 1], [baseRadius, baseRadius + 6, baseRadius]);
  const innerRadius = () =>
    interpolate(ringProgress.value, [0, 0.6, 1], [baseInner, baseInner + 4, baseInner]);

  return (
    <View style={styles.card}>
      <Text style={styles.titleText}>
        {userName}님은{"\n"}
        <Text style={styles.highlight}>'{investType}'</Text> 입니다.
      </Text>

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
              <View style={{ width: 140, height: 60, alignItems: "center", justifyContent: "center" }}>
                {/* 이전 라벨 */}
                <Animated.View style={prevStyle}>
                  <Text style={styles.centerTitle}>{previous.label}</Text>
                  <Text style={styles.centerPct}>{pct(previous.amount)}%</Text>
                </Animated.View>

                {/* 현재 라벨 */}
                <Animated.View style={[{ alignItems: "center" }, currentStyle]}>
                  <Text style={styles.centerTitle}>{current.label}</Text>
                  <Text style={styles.centerPct}>{pct(current.amount)}%</Text>
                </Animated.View>
              </View>
            )}
          />
        </Animated.View>
      </View>

      {/* 범례 */}
      <View style={styles.legendContainer}>
        {baseData[0].label === "없음" ? (
          <Text style={styles.emptyText}>찜한 상품이 없습니다.</Text>
        ) : (
          baseData.map((item, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.label}: {pct(item.amount)}%
              </Text>
            </View>
          ))
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors?.white ?? "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  titleText: {
    fontSize: 20,
    fontFamily: "BasicBold",
    color: Colors.black,
    textAlign: "left",
    marginLeft: 16,
    marginBottom: 16,
    lineHeight: 30,
  },
  highlight: {
    fontFamily: "BasicBold",
    fontSize: 28,
    color: Colors.primary,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 26,
  },
  centerTitle: { fontSize: 16, fontFamily: "BasicBold", color: Colors.black },
  centerPct: { fontSize: 11, fontFamily: "BasicMedium", color: "#8A8AA3", marginTop: 1 },
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
  emptyIcon: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 6,
    fontSize: 16,
    color: Colors.gray,
    fontFamily: "BasicMedium",
  },
  arrowStyle: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
});
