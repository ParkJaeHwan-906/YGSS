// components/molecules/Button.tsx

// 사용 방법    <Button label="안에 들어갈 텍스트" />


import { Colors } from "@/src/theme/colors";
import React from "react";
import {
    Pressable,
    PressableProps,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    ViewStyle,
} from "react-native";

type Props = PressableProps & {
    label?: string;                 // 기본 텍스트 (children 주면 무시)
    textStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
    loading?: boolean;
};

export default function Button({
    label,
    children,
    textStyle,
    style,
    loading = false,
    disabled,
    ...rest
}: Props) {
    return (
        <Pressable
            {...rest}
            disabled={disabled || loading}
            android_ripple={{ color: "rgba(0,0,0,0.08)" }}
            style={({ pressed }) => [
                styles.base,                 // 기본 스타일
                pressed && styles.pressed,   // 눌림 효과
                disabled && styles.disabled, // 비활성화
                style,                       // 💡 사용자가 넘긴 스타일이 최종적으로 덮어씀
            ]}
        >
            {children ? (
                children
            ) : (
                <Text style={[styles.label, textStyle]}>
                    {loading ? "..." : label}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        width: "95%",
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        // soft shadow
        shadowColor: Colors.primary,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 10,
    },
    label: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: "BasicBold",
        textAlign: "center",
    },
    pressed: { opacity: 0.95, transform: [{ translateY: 0.5 }] },
    disabled: { opacity: 0.5 },
});
