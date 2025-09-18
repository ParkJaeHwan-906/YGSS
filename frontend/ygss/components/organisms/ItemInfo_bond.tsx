// components/organisms/ItemInfo.tsx
import ItemProperty from "@/components/molecules/ItemProperty";
import { Colors } from "@/src/theme/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

// 아이콘 불러오기
const fireIcon = require("@/assets/icon/fire.png");
const bondIcon = require("@/assets/icon/bond.png");
const interestIcon = require("@/assets/icon/interest.png");

type ProductDetail = {
    productName: string;
    riskGrade: number;
    publisherGrade: string; // 신용 등급
    finalProfitRate: number; // 만기익 누적 수익률
    couponRate: number;  // 표면 금리
    publishedRate: number; // 공시 금리
    evaluationRate: number; // 평가 금리
    maturityYears: number; // 만기년수
    expiredDay: string; // 만기일
    publisher: string; // 발행처
};

export default function ItemInfo({ productDetail }: { productDetail: ProductDetail }) {

    // 위험등급 색상
    const getRiskColor = (risk: number) => {
        switch (risk) {
            case 5:
                return "#FA9090"; // 매우높은 위험
            case 4:
                return "#FF955C"; // 높은 위험
            case 3:
                return "#FFDC00"; // 다소 높은 위험
            case 2:
                return "#8FCE6A"; // 보통 위험
            case 1:
            default:
                return "#7F8AF3"; // 낮은 위험
        }
    };

    // 위험등급 텍스트
    const getRiskLabel = (risk: number) => {
        switch (risk) {
            case 5:
                return "매우높은 위험";
            case 4:
                return "높은 위험";
            case 3:
                return "다소높은 위험";
            case 2:
                return "보통 위험";
            case 1:
            default:
                return "낮은 위험";
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.productContainer}>
                <Text style={styles.productText}>{productDetail.productName}</Text>
            </View>

            <View style={styles.propertyContainer}>
                <ItemProperty
                    icon={fireIcon}
                    label="위험등급"
                    value={getRiskLabel(productDetail.riskGrade)}
                    valueColor={getRiskColor(productDetail.riskGrade)}
                />
                <ItemProperty
                    icon={bondIcon}
                    label="상품유형"
                    value="채권"
                />
                <ItemProperty
                    icon={interestIcon}
                    label="만기 시 수익률"
                    value={`${productDetail.finalProfitRate}%`}
                    valueColor="#FF0000"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors?.back ?? "#F4F6FF",
        padding: 20,
    },
    productContainer: {
        alignSelf: "center",
        marginTop: 20,
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
        marginBottom: 10,
    },
});
