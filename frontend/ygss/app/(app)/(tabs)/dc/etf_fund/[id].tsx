// app/(app)/(tabs)/dc/[id].tsx
import Button from "@/components/molecules/Button";
import Caution from "@/components/molecules/Caution";
import ItemCorp from "@/components/molecules/ItemCorp";
import ItemRatio from "@/components/molecules/ItemRatio";
import ItemStrat from "@/components/molecules/ItemStrat";
import ProfitChart from "@/components/molecules/ProfitChart";
import ItemInfo from "@/components/organisms/ItemInfo";
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, BackHandler, Easing, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fireIcon = require("@/assets/icon/fire.png");
const etfIcon = require("@/assets/icon/etf.png");
const bondIcon = require("@/assets/icon/bond.png");
const fundIcon = require("@/assets/icon/fund.png");
const interestIcon = require("@/assets/icon/interest.png");

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function DcDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const numericId = Number(id); // params는 string으로 받아오기 때문에 숫자로 변환
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState<boolean | null>(null);
    const [loadingLike, setLoadingLike] = useState(false);
    const accessToken = useAppSelector((s) => s.auth.accessToken);
    const router = useRouter();
    const { from } = useLocalSearchParams<{ from: string }>();

    const handleLikeToggle = async () => {
        try {
            setLoadingLike(true);
            const url = `${API_URL}/pension/product/${numericId}/like`;

            const res = await axios.post(
                url,
                {},
                {
                    headers: {
                        Authorization: `A103 ${accessToken}`,
                    },
                }
            );
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
    // 그래프
    const [graphData, setGraphData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 상품 기본 정보
                const detailUrl = `${API_URL}/product/dc/${numericId}`;
                const detailRes = await axios.get(detailUrl, {
                    headers: { Authorization: `A103 ${accessToken}` }
                });
                // 그래프 정보
                const graphUrl = `${API_URL}/product/dc/${numericId}/graph`;
                const graphRes = await axios.get(graphUrl, {
                    headers: { Authorization: `A103 ${accessToken}` }
                });
                console.log(graphRes.data)
                setProductDetail(detailRes.data);
                setGraphData(graphRes.data);
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

    // 마이페이지에서 온 경우
    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (from === "mypage") {
                router.replace("/mypage"); // 마이페이지로 고정
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [from]);

    // 화살표 애니메이션
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

    // 종목 구성 애니메이션
    const [showRatio, setShowRatio] = useState(false);
    const opacity = useRef(new Animated.Value(0)).current;
    const slideY = useRef(new Animated.Value(-20)).current; // 위에서 내려오는 효과

    const toggleRatio = () => {
        if (showRatio) {
            // 사라질 때
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideY, {
                    toValue: -20,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setShowRatio(false));
        } else {
            // 보이게 할 때
            setShowRatio(true);
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
            ) : !productDetail ? (
                <Text>상품 정보를 불러올 수 없습니다.</Text>
            ) : !graphData ? (
                <Text>그래프 데이터를 불러올 수 없습니다.</Text>
            ) : (
                <>
                    <ScrollView contentContainerStyle={styles.scrollContent}>

                        {/* 상품 기본 정보 */}
                        <ItemInfo productDetail={productDetail} />

                        {/* 투자 전략 */}
                        <View style={styles.stratContainer}>
                            <ItemStrat data={graphData.investStrategy} />
                        </View>

                        {/* 기간별 수익률 */}
                        <View style={styles.profitContainer}>
                            <ProfitChart data={graphData.priceChart} />
                        </View>

                        {/* 운용사 */}
                        <View style={styles.corpContainer}>
                            <ItemCorp company={productDetail.company} />
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
                                <Ionicons
                                    name="chevron-down-outline"
                                    size={24}
                                    color="black"
                                    onPress={toggleRatio}
                                />
                            </Animated.View>
                        </View>

                        {showRatio && (
                            <Animated.View
                                style={[
                                    styles.ratioContainer,
                                    { opacity, transform: [{ translateY: slideY }] },
                                ]}
                            >
                                <ItemRatio data={graphData.doughnutChart} />
                            </Animated.View>
                        )}

                        <View>
                            <Caution />
                        </View>


                    </ScrollView>

                    {/* 상품 찜하기 버튼 fixed 고정 */}
                    {/* 찜 해제하기 색깔 변경 */}
                    <Button onPress={() => { handleLikeToggle() }}
                        style={[
                            styles.button,
                            liked ? { backgroundColor: "#AA00FF" } : {},
                        ]}
                        label={liked === true ? "찜 해제하기" : liked === false ? "찜하기" : "로그인 후 이용해주세요"}
                        disabled={loadingLike || liked === null}>
                    </Button>
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
    stratContainer: { backgroundColor: Colors.white, marginBottom: 10 },
    corpContainer: { backgroundColor: Colors.white, marginBottom: 10 },
    profitContainer: { backgroundColor: Colors.white, marginBottom: 10 },
    pointContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    pointText: {
        fontFamily: "BasicBold",
        fontSize: 15,
        color: Colors.black,
        marginBottom: 20,
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