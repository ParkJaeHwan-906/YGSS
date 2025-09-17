// components/organisms/ItemInfo.tsx
import ItemProperty from "@/components/molecules/ItemProperty";
import { Colors } from "@/src/theme/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

// 아이콘 불러오기
const fireIcon = require("@/assets/icon/fire.png");
const etfIcon = require("@/assets/icon/etf.png");
const bondIcon = require("@/assets/icon/bond.png");
const fundIcon = require("@/assets/icon/fund.png");
const interestIcon = require("@/assets/icon/interest.png");

type ProductDetail = {
    productSystypeSummary: string;
    product: string;
    riskGrade: string;
    productType: string;
    profitPrediction: number;
};

export default function ItemInfo({ productDetail }: { productDetail: ProductDetail }) {
    // 상품 유형 아이콘
    const getProductIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case "etf":
                return etfIcon;
            case "bond":
                return bondIcon;
            case "펀드":
            case "fund":
                return fundIcon;
            default:
                return fireIcon;
        }
    };

    // 위험등급 색상
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "매우높은위험":
                return "#FA9090";
            case "높은위험":
                return "#FF955C";
            case "다소높은위험":
                return "#FFDC00";
            case "보통위험":
                return "#8FCE6A";
            default:
                return "#7F8AF3";
        }
    };

    return (
        <>
            <View style={styles.topContainer}>
                <Text style={styles.topText}>{productDetail.productSystypeSummary}</Text>
            </View>

            <View style={styles.productContainer}>
                <Text style={styles.productText}>{productDetail.product}</Text>
            </View>

            <View style={styles.propertyContainer}>
                <ItemProperty
                    icon={fireIcon}
                    label="위험등급"
                    value={productDetail.riskGrade}
                    valueColor={getRiskColor(productDetail.riskGrade)}
                />
                <ItemProperty
                    icon={getProductIcon(productDetail.productType)}
                    label="상품유형"
                    value={productDetail.productType}
                />
                <ItemProperty
                    icon={interestIcon}
                    label="예상수익률"
                    value={`${productDetail.profitPrediction}%`}
                    valueColor="#FF0000"
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    topContainer: {
        alignSelf: "center",
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 30,
        shadowColor: Colors.primary,
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 6,
        marginBottom: 15,
    },
    topText: {
        fontFamily: "BasicBold",
        fontSize: 12,
        color: Colors.black,
    },
    productContainer: {
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 20,
    },
    productText: {
        fontFamily: "BasicBold",
        fontSize: 25,
        color: Colors.black,
        textAlign: "center",
    },
    propertyContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingVertical: 20,
        backgroundColor: Colors.back,
        marginBottom: 20,
    },
});
