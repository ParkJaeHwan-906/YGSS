// app/(app)/(tabs)/dc/[id].tsx
import Button from "@/components/molecules/Button";
import Caution from "@/components/molecules/Caution";
import ItemInfo_bond from "@/components/organisms/ItemInfo_bond";
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, BackHandler, Easing, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function DcDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const numericId = id ? Number(id) : null; // params는 string으로 받아오기 때문에 숫자로 변환
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState<boolean | null>(null);
    const [loadingLike, setLoadingLike] = useState(false);
    const accessToken = useAppSelector((s) => s.auth.accessToken);
    const router = useRouter();
    const { from } = useLocalSearchParams<{ from: string }>();

    // 마이페이지에서 온 경우
    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (from === "mypage") {
                router.back();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [from]);

    const handleLikeToggle = async () => {
        try {
            setLoadingLike(true);
            const url = `${API_URL}/pension/bond/${numericId}/like`;

            const res = await axios.post(
                url,
                {},
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
                const detailUrl = `${API_URL}/product/dc/bond/${numericId}`;
                const detailRes = await axios.get(detailUrl, {
                    headers: { Authorization: `A103 ${accessToken}` }
                });
                console.log(detailRes.data)
                setProductDetail(detailRes.data);
                setLiked(detailRes.data.isLiked);
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

    // if (loading) return <ActivityIndicator size="large" color={Colors.primary} />;
    // if (!productDetail) return <Text>상품 정보를 불러올 수 없습니다.</Text>;

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
            ) : !productDetail ? (
                <Text>상품 정보를 불러올 수 없습니다.</Text>
            ) : (
                <>
                    <ScrollView contentContainerStyle={styles.scrollContent}>

                        {/* 상품 기본 정보 */}
                        <View style={styles.productContainer}>
                            <ItemInfo_bond productDetail={productDetail} />
                        </View>

                        {/* 발행처 */}
                        <View style={styles.publisherContainer}>
                            <Text style={styles.publisherText}>발행처</Text>
                            <Text style={styles.publisherValue}>• {productDetail.publisher}</Text>
                            <Text style={styles.publisherValue}>• 신용 등급: {productDetail.publisherGrade}</Text>
                        </View>

                        {/* 만기일/ 잔존기간 */}
                        <View style={styles.expireContainer}>
                            <View style={styles.expireRow}>
                                <Text style={styles.expireTitle}>만기일:</Text>
                                <Text style={styles.expireText}> {productDetail.expiredDay}</Text>
                            </View>
                            <View style={styles.expireRow}>
                                <Text style={styles.expireTitle}>만기까지:</Text>
                                <Text style={styles.expireText}> {productDetail.maturityYears}년</Text>
                            </View>
                        </View>

                        {/* 종목 구성 */}
                        <View style={styles.pointContainer}>
                            <Image
                                source={require("@/assets/char/pointAlchi.png")}
                                style={styles.pointAlchi}
                                resizeMode="contain"
                            />
                            <Text style={styles.pointText}>수익률을 자세히 알아보아요</Text>
                            <Animated.View style={{ transform: [{ translateY }] }}>
                                <Ionicons name="chevron-down-outline" size={24} color="black" />
                            </Animated.View>
                        </View>

                        {/* 수익률 바 차트 */}
                        <View style={styles.chartContainer}>
                            <BarChart
                                data={[
                                    {
                                        value: productDetail.publishedRate,
                                        label: "매수수익률",
                                        frontColor: Colors.primary,
                                    },
                                    {
                                        value: productDetail.couponRate,
                                        label: "표면금리",
                                        frontColor: "#9BB1FF",
                                    },
                                    {
                                        value: productDetail.evaluationRate,
                                        label: "민평수익률",
                                        frontColor: "#BFB4F0",
                                    },
                                ]}
                                barWidth={60}
                                adjustToWidth
                                hideRules={false}
                                scrollAnimation={false}
                                yAxisLabelSuffix="(%)"
                                yAxisTextStyle={{ fontFamily: "BasicMedium", fontSize: 10, color: Colors.gray }}
                                xAxisLabelTextStyle={{ fontFamily: "BasicMedium", fontSize: 12, color: Colors.black }}
                                yAxisColor={Colors.gray}
                                xAxisColor={Colors.gray}
                                noOfSections={5}
                                showValuesAsTopLabel
                                topLabelTextStyle={{
                                    color: Colors.primary,
                                    fontSize: 11,
                                    fontFamily: "BasicMedium",
                                }}
                            />
                        </View>


                        {/* 유의사항 */}
                        <Caution />

                    </ScrollView>

                    {/* 상품 찜하기 버튼 fixed 고정 */}
                    {/* 찜 해제하기 색깔 변경 */}
                    <Button onPress={() => { handleLikeToggle() }} style={[
                        styles.button,
                        liked ? { backgroundColor: "#AA00FF" } : {},
                    ]} label={liked ? "찜 해제하기" : "찜하기"} disabled={loadingLike}></Button>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.back,
    },
    productContainer: { backgroundColor: Colors.white, marginTop: 20 },
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
    chartContainer: {
        padding: 16,
        backgroundColor: Colors.white,
        marginBottom: 30,
    },
    expireContainer: {
        padding: 16,
        backgroundColor: Colors.white,
        marginBottom: 30,
    },
    expireRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    expireTitle: {
        fontFamily: "BasicBold",
        fontSize: 18,
        color: Colors.black,
        marginBottom: 10,
    },
    expireText: {
        fontFamily: "BasicMedium",
        fontSize: 15,
        color: Colors.gray,
        textAlign: "right",
        flex: 1,
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