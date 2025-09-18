// components/molecules/TabButton.tsx

import React from "react"
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { Colors } from "@/src/theme/colors";

type Props = {
    label: string,
    active?: boolean,
    disabled?: boolean,
    onPress?: () => void,
    style?: ViewStyle,
    subtitle?: string,
    colors?: {
        bg?: string;
        border?: string;
        text?: string;
        activeBg?: string;
        activeText?: string;
        disabledBg?: string;
        disabledText?: string;
      };
};


export default function TabButton({
    label,
    subtitle,
    active = false,
    disabled = false,
    onPress,
    style,
    colors,
  }: Props) {
    const c = {
      bg: Colors?.white ?? "#FFFFFF",
      text: Colors?.black ?? "#111827",
      activeBg: Colors?.primary ?? "#111827",
      activeText: Colors?.white ?? "#FFFFFF",
      disabledBg: Colors?.gray ?? "#F3F4F6",
      disabledText: Colors?.gray ?? "#9CA3AF",
    };

    const containerStyle = [
      styles.box,
      { backgroundColor: Colors?.white ?? "#FFFFFF", shadowColor: Colors.primary,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 10, },
      active && { backgroundColor: Colors?.primary ?? "#111827" },
      disabled && { backgroundColor: Colors?.gray ?? "#F3F4F6" },
      style,
    ];
  
    const labelStyle = [
      styles.label,
      { color: Colors?.black ?? "#111827" },
      active && { color: Colors?.white ?? "#FFFFFF", fontWeight: "700" as const },
      disabled && { color: Colors?.gray ?? "#9CA3AF" },
    ];
  
    const subtitleStyle = [
      styles.subtitle,
      { color: active ? Colors?.white ?? "#FFFFFF" : Colors?.black ?? "#111827" },
      disabled && { color: Colors?.gray ?? "#9CA3AF" },
    ];
  
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          containerStyle,
          pressed && !disabled && { transform: [{ scale: 0.97 }] },
        ]}
        android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
      >
        <View style={styles.center}>
          <Text style={labelStyle} numberOfLines={1}>
            {label}
          </Text>
          {!!subtitle && (
            <Text style={subtitleStyle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </Pressable>
    );
  }
  
  const styles = StyleSheet.create({
    box: {
      width: 80,   // 고정 가로
      height: 40,  // 고정 세로
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: Colors.primary,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 10,
    },
    center: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    label: {
      fontSize: 14,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 11,
      opacity: 0.8,
    },
  });