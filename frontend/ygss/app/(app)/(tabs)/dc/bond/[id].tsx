// app/(app)/(tabs)/dc/[id].tsx
import Button from "@/components/molecules/Button";
import Caution from "@/components/molecules/Caution";
import ItemInfo_bond from "@/components/organisms/ItemInfo_bond";
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function DcDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const numericId = Number(id); // params는 string으로 받아오기 때문에 숫자로 변환
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState<boolean | null>(null);
    const [loadingLike, setLoadingLike] = useState(false);
    const accessToken = useAppSelector((s) => s.auth.accessToken);

    const handleLikeToggle = async () => {
        try {
            setLoadingLike(true);
            const url = `${API_URL}/pension/bond/${numericId}/like`;

            const res = await axios.post(
                url,
                { numericId },
                {
                    headers: {
                        Authorization: `A103 ${accessToken}`,
                    },
                }
            );
            console.log(res.data)
            // API 응답이 true/false
            setLiked(res.data === true);
        } catch (err: any) {
            console.log(err)
            console.error("찜하기 요청 실패:", err.response?.status);
        } finally {
            setLoadingLike(false);
        }
    };

    // 상품 상세정보
    const [productDetail, setProductDetail] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 상품 기본 정보
                const detailUrl = `${API_URL}/pension/bond/${numericId}`;
                const detailRes = await axios.get(detailUrl, {
                    headers: { Authorization: `A103 ${accessToken}` }
                });
                console.log(detailRes.data)
                setProductDetail(detailRes.data);
            } catch (err: any) {
                console.error("상품 상세 불러오기 실패");
                console.error("상태코드:", err.response?.status);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: 6, // 아래로 6px 이동
                    duration: 600,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0, // 원위치
                    duration: 600,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [translateY]);

    if (loading) return <ActivityIndicator size="large" color={Colors.primary} />;
    if (!productDetail) return <Text>상품 정보를 불러올 수 없습니다.</Text>;

    return (
        <SafeAreaView style={styles.container}>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* 상품 기본 정보 */}
                <ItemInfo_bond productDetail={productDetail} />

                {/* 발행처 */}
                <View style={styles.publisherContainer}>
                    <Text style={styles.publisherText}>발행처</Text>
                    <Text style={styles.publisherValue}>• {productDetail.publisher}</Text>
                </View>

                {/* 만기일/ 잔존기간 */}
                <View style={styles.expireContainer}>
                    <View style={styles.expireRow}>
                        <Text style={styles.expireTitle}>만기일:</Text>
                        <Text > {productDetail.expiredDay}</Text>
                    </View>
                    <View style={styles.expireRow}>
                        <Text style={styles.expireTitle}>만기까지:</Text>
                        <Text> {productDetail.maturityYears}년</Text>
                    </View>

                </View>

                {/* 종목 구성 */}
                <View style={styles.pointContainer}>
                    <Image
                        source={require("@/assets/char/pointAlchi.png")}
                        style={styles.pointAlchi}
                        resizeMode="contain"
                    />
                    <Text style={styles.pointText}>종목 구성은 이렇게 되어 있어요 !</Text>
                    <Animated.View style={{ transform: [{ translateY }] }}>
                        <Ionicons name="chevron-down-outline" size={24} color="black" />
                    </Animated.View>
                </View>

                <View>
                    <Caution />
                </View>


            </ScrollView>

            {/* 상품 찜하기 버튼 fixed 고정 */}
            {/* 찜 해제하기 색깔 변경 */}
            <Button onPress={() => { handleLikeToggle() }} style={[
                styles.button,
                liked ? { backgroundColor: "#AA00FF" } : {},
            ]} label={liked ? "찜 해제하기" : "찜하기"} disabled={loadingLike}></Button>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.back,
    },
    stratContainer: { backgroundColor: Colors.white, marginBottom: 10 },
    publisherContainer: { backgroundColor: Colors.white, marginBottom: 10, padding: 16 },
    publisherText: {
        fontSize: 18,
        fontFamily: "BasicBold",
        marginBottom: 10,
    },
    publisherValue: {
        fontSize: 16,
        fontFamily: "BasicMedium",
        color: Colors.gray,
        marginLeft: 20
    },
    pointContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    pointText: {
        fontFamily: "BasicBold",
        fontSize: 15,
        color: Colors.black,
        marginVertical: 20,
    },
    expireContainer: {
        padding: 16,
        alignItems: "flex-end",
        backgroundColor: Colors.white,
        marginBottom: 30,
    },
    expireRow: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    expireTitle: {
        fontFamily: "BasicBold",
        fontSize: 18,
        color: Colors.black,
    },
    expireText: {
        fontFamily: "BasicMedium",
        fontSize: 15,
        color: Colors.black,
    },
    button: {
        position: "absolute",
        bottom: 15,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    ratioContainer: {
        backgroundColor: Colors.white,
        marginBottom: 10,
    },
    pointAlchi: {
        width: 200,
        height: 200,
        alignSelf: "center",
    },
});