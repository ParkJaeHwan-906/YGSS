import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

type Props = {
  title: string;
  textStyle?: any;
  delay?: number;
  gap?: number;
  duration?: number;                 // 고정 주기(ms)
  direction?: "left" | "right";
  viewportWidth?: number;            // 기준 폭(없으면 onLayout)
  threshold?: number;                // 글자수 컷(짧으면 안 돌림)
};

export default function MarqueeTitle({
  title,
  textStyle,
  delay = 300,
  gap = 16,
  duration = 6000,
  direction = "left",
  viewportWidth,
  threshold = 15,
}: Props) {
  const [boxW, setBoxW] = useState(0);          // 실제 타이틀 영역 폭
  const [trackW, setTrackW] = useState(0);      // 트랙(텍스트×2+gap) 실측 폭
  const [shouldScroll, setShouldScroll] = useState(false); // 최종 스크롤 여부
  const offset = useSharedValue(0);

  // 1) 타이틀 영역 폭
  const onBoxLayout = (e: LayoutChangeEvent) => {
    if (viewportWidth) return;
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0 && w !== boxW) setBoxW(w);
  };
  const baseW = viewportWidth ?? boxW;

  // 2) "잠정" 스크롤 가정: 길이가 충분하고(글자수) 영역 폭이 결정되면 일단 마퀴 뷰 렌더
  const longEnough = (title?.length ?? 0) > threshold;
  const renderMarquee = longEnough && baseW > 0;

  // 3) 트랙 실측으로 최종 판단
  //    trackW = singleTextW * 2 + gap  => singleTextW = (trackW - gap) / 2
  const singleTextW = trackW > 0 ? Math.max(0, (trackW - gap) / 2) : 0;
  const period = shouldScroll ? singleTextW + gap : 0;

  // 트랙 onLayout에서 실제 폭을 받고 최종 스크롤 여부 결정
  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0 && w !== trackW) setTrackW(w);
  };

  useEffect(() => {
    if (!renderMarquee) {
      setShouldScroll(false);
      cancelAnimation(offset);
      offset.value = 0;
      return;
    }
    // singleTextW가 잡히면 최종 결론
    if (singleTextW > 0) {
      setShouldScroll(singleTextW > baseW); // 텍스트 한 벌이 칸보다 길 때만 스크롤
    }
  }, [renderMarquee, singleTextW, baseW]);

  // 4) 애니 시작/정지 (고정 duration)
  useEffect(() => {
    if (!shouldScroll || period <= 0) {
      cancelAnimation(offset);
      offset.value = 0;
      return;
    }
    const target = direction === "left" ? -period : period;
    const timer = setTimeout(() => {
      offset.value = withRepeat(
        withTiming(target, { duration, easing: Easing.linear }),
        -1,
        false
      );
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimation(offset);
    };
  }, [shouldScroll, period, direction, duration, delay]);

  const trackStyle = useAnimatedStyle(() => {
    if (!shouldScroll || period <= 0) return { transform: [{ translateX: 0 }] };
    const raw = offset.value;
    const mod =
      direction === "left"
        ? (((raw % -period) + -period) % -period)
        : (((raw % period) + period) % period);
    return { transform: [{ translateX: mod }] };
  }, [shouldScroll, period, direction]);

  return (
    <View
      style={styles.viewport}
      onLayout={viewportWidth ? undefined : onBoxLayout}
    >
      {!renderMarquee ? (
        // 짧으면 고정 출력 (…생성 안 함)
        <Text style={[styles.title, textStyle]} numberOfLines={1} ellipsizeMode="clip">
          {title}
        </Text>
      ) : (
        // 일단 마퀴 뷰 렌더 → 트랙 폭 실측 → 최종 스크롤 여부/period 확정
        <Animated.View style={[styles.track, trackStyle]} onLayout={onTrackLayout}>
          <Text style={[styles.title, styles.noShrink, textStyle]} numberOfLines={1} ellipsizeMode="clip">
            {title}
          </Text>
          <View style={{ width: gap }} />
          <Text style={[styles.title, styles.noShrink, textStyle]} numberOfLines={1} ellipsizeMode="clip">
            {title}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { width: "100%", overflow: "hidden" },
  track: { flexDirection: "row", alignItems: "center" },
  noShrink: { flexShrink: 0 },
  title: { fontSize: 16, lineHeight: 20, color: "#111", fontFamily: "BasicBold" },
});
