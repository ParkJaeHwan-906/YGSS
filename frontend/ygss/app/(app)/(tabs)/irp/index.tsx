import { Colors } from "@/src/theme/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
// 아이콘은 require로 불러오기
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Irp() {
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container]}>
            {/* 상세정보페이지로 가는 버튼 */}
            <TouchableOpacity
                onPress={() => router.push({ pathname: "/irp/[id]", params: { id: "1" } })}
            >
                <Text>상세정보</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.back,
        gap: 10,
    },

});