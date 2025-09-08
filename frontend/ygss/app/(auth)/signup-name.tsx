import React, { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
    View, Text, TextInput, Pressable, StyleSheet
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function SignupName() {
    const router = useRouter();
    const ref = useRef<TextInput>(null);
    const [name, setName] = useState("");
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const t = setTimeout(() => ref.current?.focus(), 60);
        return () => clearTimeout(t);
    }, []);

    const canNext = name.trim().length > 0;

    return (
        <View style={{ flex: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.wrap}>
                        <Text style={styles.title}>회원가입</Text>
                        <Text style={styles.state}>1/4</Text>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>이름</Text>
                            <TextInput
                                ref={ref}
                                autoFocus
                                value={name}
                                onChangeText={setName}
                                placeholder=" "
                                style={styles.underlineInput}
                                returnKeyType="next"
                                onSubmitEditing={() => canNext && router.push("/(auth)/signup-email")}
                            />
                        </View>

                        <Pressable
                            onPress={() => router.push("/(auth)/signup-email")}
                            disabled={!canNext}
                            style={({ pressed }) => [
                                styles.nextBtn,
                                !canNext && { opacity: 0.4 },
                                pressed && { transform: [{ scale: 0.98 }] },
                            ]}
                        >
                            <Text style={styles.nextTxt}>다음</Text>
                        </Pressable>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flex: 1, paddingHorizontal: 20, paddingBottom: 24 },
    title: { fontSize: 30, fontWeight: "800", color: "#111", textAlign: "center", marginTop: 8, marginBottom: 50 },
    state: { fontSize: 14, position: "absolute", right: 20, top: 20 },
    label: { fontSize: 20, fontWeight: "800", color: "#5465FF", marginBottom: 10, marginTop: 8 },
    underlineInput: {
        borderBottomWidth: 1.2,
        borderBottomColor: "#8ea2ff",
        paddingVertical: 10,
        fontSize: 16,
        color: "#111",
    },
    nextBtn: {
        backgroundColor: "#5465FF",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        elevation: 6,
    },
    nextTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
