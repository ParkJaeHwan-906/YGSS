// components/ItemProperty.tsx
import { Colors } from "@/src/theme/colors";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

type Props = {
    icon: ImageSourcePropType;  // 아이콘 이미지
    label: string;              // "위험등급", "상품유형" 등
    value: string;              // "높은위험", "상장지수펀드 (ETF)" 등
    valueColor?: string;        // 값 텍스트 색상 (예: 빨강, 파랑)
};

export default function ItemProperty({ icon, label, value, valueColor = "#000" }: Props) {
    const dynamicFontSize = value.length > 5 ? styles.valueSmall.fontSize : styles.value.fontSize;

    return (
        <View style={styles.container}>
            <View style={styles.iconWrap}>
                <Image source={icon} style={styles.icon} resizeMode="contain" />
            </View>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 110,
        alignItems: "center",
        marginHorizontal: 8,
        marginVertical: 1,
    },
    iconWrap: {
        width: 60,
        height: 60,
        marginBottom: 6,
        borderRadius: 30,
        backgroundColor: Colors.white,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: Colors.primary,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    icon: {
        width: 40,
        height: 40,
    },
    label: {
        fontSize: 13,
        fontFamily: "BasicMedium",
        color: "#555",
        marginTop: 6,
        textAlign: "center",
        height: 20,
    },
    value: {
        fontSize: 15,            // 기본 크기
        fontFamily: "BasicBold",
        marginTop: 2,
        textAlign: "center",
    },
    valueSmall: {
        fontSize: 13,            // 5글자 이상일 때 -2
    },
});
