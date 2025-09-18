// components/organisms/Tab.tsx
import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  ViewStyle,
} from "react-native";
import TabButton from "@/components/molecules/TabButton";
import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";

export type AssetGroup = "위험자산" | "안전자산";
export type RiskyTab = "전체" | "ETF" | "펀드";
export type SafeTab = "채권";
export type CurrentTab = RiskyTab | SafeTab;
export type SortOrder = "desc" | "asc";

type Props = {
  group: AssetGroup;
  tab: CurrentTab;
  onGroupChange: (g: AssetGroup) => void;
  onTabChange: (t: CurrentTab) => void;
  style?: ViewStyle;

  // 아이콘 제어
  sortOrder?: SortOrder;
  onToggleSort?: () => void;

  // 필요시 커스터마이즈
  riskyTabs?: RiskyTab[]; // 기본: ["전체","ETF","펀드"]
  safeTabs?: SafeTab[];   // 기본: ["채권"]
  colors?: {
    trackBg?: string;
    trackBorder?: string;
    sliderBg?: string;
    text?: string;
    dimText?: string;
  };
};

export default function Tab({
  group,
  tab,
  onGroupChange,
  onTabChange,
  style,
  riskyTabs = ["전체", "ETF", "펀드"],
  safeTabs = ["채권"],
  colors,
  sortOrder = "desc",
  onToggleSort = () => {},
}: Props) {
  const c = {
    trackBg: Colors?.gray ?? "#F3F4F6",   // gray-100
    trackBorder: Colors?.gray ?? "#E5E7EB",
    sliderBg: Colors?.white ?? "#FFFFFF",
    text: Colors?.black ?? "#111827",
    dimText: Colors?.gray ?? "#6B7280",
  };

  // --- 상단 슬라이더 애니메이션 ---
  const sliderX = useRef(new Animated.Value(0)).current;
  const segmentW = useRef(0);
  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    segmentW.current = w / 2;
    // 처음 렌더 시 현재 group 위치로 이동
    Animated.timing(sliderX, {
      toValue: group === "위험자산" ? 0 : segmentW.current,
      duration: 0,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    Animated.timing(sliderX, {
      toValue: group === "위험자산" ? 0 : segmentW.current,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [group, sliderX]);

  const subTabs = useMemo<CurrentTab[]>(
    () => (group === "위험자산" ? riskyTabs : safeTabs),
    [group, riskyTabs, safeTabs]
  );


  useEffect(() => {
    // 그룹 변경 시 기본 탭을 강제 세팅
    if (group === "위험자산" && tab !== "전체") {
      onTabChange("전체");
    } else if (group === "안전자산" && tab !== "채권") {
      onTabChange("채권");
    }
  }, [group]); // group 바뀔 때만 동작


  return (
    <View style={[styles.wrap, style]}>
      {/* 상단 그룹 토글(슬라이드바) */}
      <View
        style={[styles.track, { 
            backgroundColor: Colors?.back ?? "#F3F4F6", 
            borderColor: Colors?.back ?? "#E5E7EB",
            shadowColor: Colors.primary,
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 10,
        }]}
        onLayout={onTrackLayout}
      >
        <Animated.View
          style={[
            styles.slider,
            {
                backgroundColor: Colors?.primary ?? "#FFFFFF", 
                width: "50%", 
                transform: [{ translateX: sliderX }]
            },
          ]}
        />
        <Pressable
          style={styles.segment}
          onPress={() => onGroupChange("위험자산")}
          accessibilityRole="button"
          accessibilityState={{ selected: group === "위험자산" }}
        >
          <Text style={[styles.segmentText, { color: group === "위험자산" ? Colors?.white ?? "#FFFFFF" : Colors?.black ?? "#111827" }]}>
            위험자산
          </Text>
        </Pressable>
        <Pressable
          style={styles.segment}
          onPress={() => onGroupChange("안전자산")}
          accessibilityRole="button"
          accessibilityState={{ selected: group === "안전자산" }}
        >
          <Text style={[styles.segmentText, { color: group === "안전자산" ? Colors?.white ?? "#FFFFFF" : Colors?.black ?? "#111827" }]}>
            안전자산
          </Text>
        </Pressable>
      </View>

      {/* 탭 + 정렬 아이콘 */}
      <View style={styles.bottomRow}>
        {/* 하단 하위 탭들 */}
        <View style={styles.leftWrap}>
            {subTabs.map((t) => (
            <TabButton
                key={t}
                label={t}
                active={tab === t}
                onPress={() => onTabChange(t)}
                style={styles.gap}
                // 필요 시 색상 통일
                colors={{
                activeBg: Colors?.primary ?? "#111827",
                activeText: Colors?.white ?? "#FFFFFF",
                bg: Colors?.white ?? "#FFFFFF",
                border: Colors?.gray ?? "#E5E7EB",
                text: Colors?.black ?? "#111827",
                }}
            />
            ))}
        </View>

        {/* 정렬 아이콘 */}
        <Pressable
            onPress={onToggleSort}
            hitSlop={8}
            style={styles.sortBtn}
            accessibilityLabel={`정렬 (${sortOrder === "desc" ? "내림차순" : "오름차순"})`}
        >
            <Ionicons
                name="swap-vertical"
                size={30} 
                color={Colors?.gray ?? "#111827"} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  track: {
    position: "relative",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  slider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 12,
    elevation: 1, // 안드로이드 그림자
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "600",
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  leftWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gap: {
    marginRight: 10,
    marginBottom: 10,
  },
  sortBtn: {
    height: 50,
    minWidth: 44,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
