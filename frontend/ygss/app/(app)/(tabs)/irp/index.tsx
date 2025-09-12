import Caution from "@/components/molecules/Caution";
import ItemCorp from "@/components/molecules/ItemCorp";
import ItemDue from "@/components/molecules/ItemDue";
import ItemProperty from "@/components/molecules/ItemProperty";
import ItemStrat from "@/components/molecules/ItemStrat";
import { Colors } from "@/src/theme/colors";
import { StyleSheet, View } from "react-native";
// 아이콘은 require로 불러오기
import React from "react";
const fireIcon = require("@/assets/icon/fire.png");
const etfIcon = require("@/assets/icon/etf.png");
const bondIcon = require("@/assets/icon/bond.png");
const fundIcon = require("@/assets/icon/fund.png");
const interestIcon = require("@/assets/icon/interest.png");

export default function Irp() {
    const productType = "etf"; // 실제 값 (API 응답이나 props 등에서 받아오게)

    const getProductIcon = () => {
        switch (productType.toLowerCase()) {
            case "etf":
                return etfIcon;
            case "bond":
                return bondIcon;
            case "fund":
                return fundIcon;
            default:
                return fireIcon; // fallback 아이콘
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.propertyContainer}>
                <ItemProperty
                    icon={fireIcon}
                    label="위험등급"
                    value="높은위험"
                    valueColor="#FF0000"
                />
                <ItemProperty
                    icon={getProductIcon()}
                    label="상품유형"
                    value="상장지수펀드 (ETF)"
                />
                <ItemProperty
                    icon={interestIcon}
                    label="3개월 평균수익률"
                    value="13.45%"
                    valueColor="#FF0000"
                />
            </View>
            <View style={styles.stratContainer}>
                <ItemStrat />
            </View>
            <View style={styles.corpContainer}>
                <ItemCorp />
            </View>
            <View style={styles.dueContainer}>
                <ItemDue />
            </View>
            <View>
                <Caution />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.back,
        gap: 10,
    },
    propertyContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingVertical: 20,
        backgroundColor: Colors.white,
    },
    stratContainer: {
        backgroundColor: Colors.white,
    },
    corpContainer: {
        backgroundColor: Colors.white,
    },
    dueContainer: {
        backgroundColor: Colors.white,
    },
});