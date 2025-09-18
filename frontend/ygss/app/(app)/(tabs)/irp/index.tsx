import { Colors } from "@/src/theme/colors";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
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

            <TouchableOpacity
                style={styles.recomContainer}
                onPress={() => router.push("/irp/loading")}
                activeOpacity={0.9}
            >
                <Text style={styles.boxTitle}>당신에게 맞는 IRP 상품 추천</Text>
                <Text style={styles.boxDesc}>
                    알키가 당신에게 꼭 맞는{"\n"}IRP 상품을 추천해드려요!
                </Text>
                <Image source={require("@/assets/icon/coins2.png")} style={[styles.boxIcon]} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.back,
        padding: 20,
    },
    recomContainer: {
        backgroundColor: Colors.primary,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    boxTitle: {
        fontSize: 22,
        fontFamily: "BasicBold",
        marginBottom: 6,
        color: Colors.white,
    },
    boxDesc: {
        fontSize: 11,
        fontFamily: "BasicMedium",
        color: Colors.white,
    },
    boxIcon: {
        width: 90,
        height: 90,
        alignSelf: "flex-end",
        resizeMode: "contain",
    },
});