import Caution from "@/components/molecules/Caution";
import ItemCorp from "@/components/molecules/ItemCorp";
import ItemDue from "@/components/molecules/ItemDue";
import ItemProperty from "@/components/molecules/ItemProperty";
import ItemStrat from "@/components/molecules/ItemStrat";
import { Colors } from "@/src/theme/colors";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// 아이콘 불러오기
const fireIcon = require("@/assets/icon/fire.png");
const etfIcon = require("@/assets/icon/etf.png");
const bondIcon = require("@/assets/icon/bond.png");
const fundIcon = require("@/assets/icon/fund.png");
const interestIcon = require("@/assets/icon/interest.png");

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function IrpDetail({ id = 1 }: { id?: number }) {
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/product/irp/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.error("상품 상세 불러오기 실패", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getProductIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case "etf":
                return etfIcon;
            case "bond":
                return bondIcon;
            case "fund":
                return fundIcon;
            default:
                return fireIcon; // fallback
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "높은위험":
                return "#FF0000";
            case "낮은위험":
                return "#008000";
            default:
                return "#000";
        }
    };

    if (loading) return <ActivityIndicator size="large" color={Colors?.primary ?? "#4D6BFE"} />;

    if (!product) return <Text>상품 정보를 불러올 수 없습니다.</Text>;

    return (
        <View style={styles.container}>
            {/* 속성 정보 */}
            <View style={styles.propertyContainer}>
                <ItemProperty
                    icon={fireIcon}
                    label="위험등급"
                    value={product.riskGrade}
                    valueColor={getRiskColor(product.riskGrade)}
                />
                <ItemProperty
                    icon={getProductIcon(product.productType)}
                    label="상품유형"
                    value={product.productType}
                />
                <ItemProperty
                    icon={interestIcon}
                    label="예상수익률"
                    value={`${product.profitPrediction}%`}
                    valueColor="#FF0000"
                />
            </View>

            {/* 세부 정보 */}
            <View style={styles.stratContainer}>
                <ItemStrat data={product.investStrategy} />
            </View>
            <View style={styles.corpContainer}>
                <ItemCorp company={product.company} />
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
