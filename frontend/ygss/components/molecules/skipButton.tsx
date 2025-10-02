// components/molecules/SkipButton.tsx
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { Colors } from "@/src/theme/colors";

type Props = { onPress?: () => void };

export default function SkipButton({ onPress }: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={12}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel="건너뛰기"
    >
      <MotiView
        from={{ translateY: 0, scale: 1, opacity: 0.95 }}
        animate={{
          // 눌렀을 땐 둥둥 멈추고 살짝 축소
          translateY: pressed ? 0 : -6,   // -6 ~ 0 사이에서 왕복
          scale: pressed ? 0.96 : 1,
          opacity: 1,
        }}
        transition={{
          type: "timing",
          duration: pressed ? 120 : 850,
          easing: Easing.inOut(Easing.quad),
          loop: !pressed,
          repeatReverse: true,
        }}
      >
        <Text style={styles.text}>SKIP &gt;&gt;</Text>
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-end",
    position: "absolute",
    top: 6,
    right: 20,
  },
  text: {
    fontSize: 20,
    fontFamily: "Bubble",
    color: Colors.primary,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
