// components/molecules/MarqueeTitle.tsx
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = {
  title: string;
  delay?: number;          // 시작 지연(ms)
  gap?: number;            // 텍스트 사이 간격(px)
  speed?: number;          // px/s (고정 속도)  ← duration 대신 이걸로!
  direction?: "left" | "right";
  textStyle?: any;
};

export default function MarqueeTitle({
  title,
  delay = 300,
  gap = 12,
  speed = 50,              // 기본 50px/s (느리면 40, 빠르면 70 등으로)
  direction = "left",
  textStyle,
}: Props) {
  const [boxW, setBoxW] = useState<number>(0);
  const [textW, setTextW] = useState<number>(0);
  const offset = useSharedValue(0); // 누적 이동량

  const onBoxLayout = (e: LayoutChangeEvent) => setBoxW(Math.round(e.nativeEvent.layout.width));
  const onMeasureLayout = (e: LayoutChangeEvent) => {
    const w = Math.ceil(e.nativeEvent.layout.width);
    if (w > 0 && w !== textW) setTextW(w);
  };

  const period = textW + gap;                     // 한 사이클 거리
  const needsScroll = boxW > 0 && textW > boxW;   // 길 때만 스크롤

  useEffect(() => {
    if (!needsScroll || period <= 0) {
      offset.value = 0;
      return;
    }
    // 한 사이클 시간을 '속도'로부터 계산
    const durationMs = Math.max(16, Math.round((period / speed) * 1000));

    // 방향에 따라 부호 결정
    const target = (direction === "left" ? -period : period);

    const start = () => {
      // 0 -> target 무한 반복. 아래 모듈러 처리로 '점프' 없이 완전 연속.
      offset.value = withRepeat(
        withTiming(target, { duration: durationMs, easing: Easing.linear }),
        -1,
        false
      );
    };

    const t = setTimeout(start, delay);
    return () => clearTimeout(t);
  }, [needsScroll, period, speed, direction, delay]);

  // 끊김 없는 모듈러 변환
  const trackStyle = useAnimatedStyle(() => {
    if (!needsScroll || period <= 0) return { transform: [{ translateX: 0 }] };
    const raw = offset.value;
    const mod =
      direction === "left"
        ? (((raw % -period) + -period) % -period)     // 음수 주기
        : (((raw % period) + period) % period);       // 양수 주기
    return { transform: [{ translateX: mod }] };
  }, [needsScroll, period, direction]);

  return (
    <View style={styles.viewport} onLayout={onBoxLayout}>
      {/* 폭 측정용: 화면 안에서 opacity 0로 정확 측정 */}
      <Text
        style={[styles.title, textStyle, styles.hiddenMeasure]}
        onLayout={onMeasureLayout}
        numberOfLines={undefined}
      >
        {title}
      </Text>

      {!needsScroll ? (
        <Text style={[styles.title, textStyle]} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      ) : (
        <Animated.View
          style={[
            styles.track,
            { width: period * 2 }, // 텍스트2 + gap
            trackStyle,
          ]}
        >
          <Text
            style={[styles.title, textStyle, styles.scrollingText, { width: textW }]}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {title}
          </Text>
          <View style={{ width: gap }} />
          <Text
            style={[styles.title, textStyle, styles.scrollingText, { width: textW }]}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {title}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { width: "100%", overflow: "hidden" },
  track: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  title: { fontSize: 20, lineHeight: 22, color: "#111", fontFamily: "BasicBold" },
  scrollingText: { flexShrink: 0 },
  hiddenMeasure: {
    position: "absolute",
    opacity: 0,
    left: 0,
    zIndex: -1,
    pointerEvents: "none",
  },
});
