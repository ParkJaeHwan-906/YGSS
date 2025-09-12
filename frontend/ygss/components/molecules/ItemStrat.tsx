// components/ItemStrat.tsx
import { Colors } from "@/src/theme/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const leftRatio = 60;
const rightRatio = 40;
export default function ItemStrat() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>투자전략</Text>
            <View style={styles.barWrap}>
                {/* 왼쪽 블록 */}
                <View style={[styles.block, styles.leftBlock, { flex: leftRatio }]}>
                    <Text style={styles.blockText}>미국 10년 국채선물</Text>
                    <Text style={styles.percent}>60%</Text>
                </View>

                {/* 오른쪽 블록 */}
                <View style={[styles.block, styles.rightBlock, { flex: rightRatio }]}>
                    <Text style={[styles.blockText, { color: Colors.black }]}>KOSPI200</Text>
                    <Text style={[styles.percent, { color: Colors.black }]}>40%</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontFamily: "BasicBold",
        marginBottom: 10,
    },
    barWrap: {
        flexDirection: "row",
        borderRadius: 30,
        overflow: "hidden", // 둥근 모서리
    },
    block: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        height: 40,
    },
    leftBlock: {
        backgroundColor: Colors.primary, // 파란색
    },
    rightBlock: {
        backgroundColor: "#EEF1FF", // 연한 회색
    },
    blockText: {
        fontSize: 13,
        fontFamily: "BasicMedium",
        color: Colors.white,
    },
    percent: {
        fontSize: 13,
        fontFamily: "BasicMedium",
        color: Colors.white,
    },
});
