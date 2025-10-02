// components/Toast.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

type Props = {
    message: string;
    onHide: () => void;
};

export default function Toast({ message, onHide }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(1500),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(onHide);
    }, []);

    return (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        bottom: 50,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    text: {
        color: "#fff",
        fontSize: 14,
    },
});
