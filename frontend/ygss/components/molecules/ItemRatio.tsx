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

type DoughnutItem = {
  product: string;
  percentage: number;
};

const ENTER_DURATION = 800;
const SWITCH_DURATION = 1100;
const INTERVAL = 2800;

export default function ItemRatio({ data }: { data: DoughnutItem[] }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const colors = ["#4666FF", "#8BB6FF", "#A28BFF", "#FFBFE1", "#FFF1D1", "#EEF1FF"];
    return data.map((item, idx) => ({
      value: item.percentage,
      color: colors[idx % colors.length],
      label: item.product,
    }));
  }, [data]);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const prevIndexRef = useRef(0);

  const enter = useSharedValue(0);
  const progress = useSharedValue(1);

  // 안전하게 다음 인덱스로 넘어가기
  const handleNext = (next: number) => {
    prevIndexRef.current = focusedIndex; // 항상 현재 인덱스를 이전 값으로 저장
    setFocusedIndex(next);

    progress.value = 0;
    progress.value = withTiming(1, {
      duration: SWITCH_DURATION,
      easing: Easing.inOut(Easing.cubic),
    });
  };

  useEffect(() => {
    if (chartData.length === 0) return;

    // 첫 진입 애니메이션
    enter.value = withTiming(1, {
      duration: ENTER_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    const id = setInterval(() => {
      const next = (focusedIndex + 1) % chartData.length;
      handleNext(next);
    }, INTERVAL);

    return () => clearInterval(id);
  }, [focusedIndex, chartData.length]);

  const pieData = chartData.map((it, i) => ({
    ...it,
    focused: i === focusedIndex,
    onPress: () => handleNext(i), // 터치 시에도 동일 로직
  }));

  const prevIdx = prevIndexRef.current ?? focusedIndex;
  const current = chartData[focusedIndex];
  const previous = chartData[prevIdx] || current;

  // 라벨 애니메이션
  const currentStyle = useAnimatedStyle(() => {
    const t = enter.value * progress.value;
    return {
      opacity: t,
      transform: [
        {
          translateY: interpolate(t, [0, 1], [20, 0]), // 밑에서 위로 올라오는 효과
        },
      ],
    };
  });

  // 도넛 펄스 효과
  const baseRadius = 85;
  const baseInner = 55;
  const chartMotion = useAnimatedStyle(() => {
    const s = interpolate(progress.value, [0, 0.6, 1], [1, 1.05, 1]);
    return { transform: [{ scale: s }] };
  });
  const radius = () =>
    interpolate(progress.value, [0, 0.6, 1], [baseRadius, baseRadius + 6, baseRadius]);
  const innerRadius = () =>
    interpolate(progress.value, [0, 0.6, 1], [baseInner, baseInner + 4, baseInner]);

  if (chartData.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={{ textAlign: "center", color: Colors.gray, marginVertical: 20 }}>
          데이터가 없습니다
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.chartWrapper}>
        <Animated.View style={chartMotion}>
          <PieChart
            data={pieData}
            donut
            radius={radius()}
            innerRadius={innerRadius()}
            strokeColor={Colors.white}
            strokeWidth={2}
            sectionAutoFocus
            showGradient
            labelsPosition="outward"
            // centerLabelComponent 안쪽만 발췌
            centerLabelComponent={() => (
              <View
                style={{
                  width: 110,
                  minHeight: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
                }}
              >
                <Animated.View style={currentStyle}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "BasicBold",
                      color: Colors.black,
                      textAlign: "center",
                    }}
                    numberOfLines={1}               // 한 줄만
                    adjustsFontSizeToFit            // 길면 자동 축소
                    minimumFontScale={0.7}          // 최소 70%까지 줄임
                  >
                    {current.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "BasicMedium",
                      color: "#666",
                      marginTop: 2,
                      textAlign: "center",          // 퍼센트도 중앙
                    }}
                  >
                    {current.value.toFixed(2)}%
                  </Text>
                </Animated.View>
              </View>
            )}

          />
        </Animated.View>
      </View>

      {/* 범례 */}
      <View style={styles.legendContainer}>
        {chartData.map((item, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.label}:
              <Text style={{ fontFamily: "BasicMedium", color: Colors.gray }}> {item.value.toFixed(2)}%</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 18,
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
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
    rowGap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flexBasis: "33%",
    marginHorizontal: 20,
    marginBottom: 6,
  },
  dot: {
    width: 10, height: 10, borderRadius: 5, marginRight: 6,
  },
  legendText: {
    fontSize: 13, color: Colors.black, fontFamily: "BasicMedium",
  },
});
