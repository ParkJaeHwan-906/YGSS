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
import { ActivityIndicator, Animated, BackHandler, Dimensions, Easing, Image, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const { width, height } = Dimensions.get("window");

export default function DcDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const numericId = Number(id); // params는 string으로 받아오기 때문에 숫자로 변환
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState<boolean | null>(null);
    const [loadingLike, setLoadingLike] = useState(false);
    const accessToken = useAppSelector((s) => s.auth.accessToken);
    const router = useRouter();
    const { from } = useLocalSearchParams<{ from: string }>();

    //찜하기 모달
    // const [showModal, setShowModal] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const toastOpacity = useRef(new Animated.Value(0)).current;

    //찜하기 하트 애니메이션
    const [showHeart, setShowHeart] = useState(false);
    const heartPos = useRef(new Animated.ValueXY({ x: width / 2 - 50, y: height - 200 })).current;
    const heartScale = useRef(new Animated.Value(0)).current;
    const heartOpacity = useRef(new Animated.Value(0)).current;

    const showToastMessage = () => {
        setShowToast(true);
        toastOpacity.setValue(0);

        Animated.timing(toastOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            Animated.timing(toastOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setShowToast(false));
        }, 1500); // 1.5초 후 사라짐
    };

    const animateHeart = () => {
        setShowHeart(true);

        // 시작 위치: 화면 중간쯤 (버튼 위쪽)
        heartPos.setValue({ x: width / 2 - 50, y: height - 200 });
        heartScale.setValue(0);
        heartOpacity.setValue(1);

        Animated.parallel([
            Animated.sequence([
                Animated.spring(heartScale, {
                    toValue: 1.2,
                    useNativeDriver: true,
                }),
                Animated.spring(heartScale, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(heartPos, {
                toValue: { x: width - 100, y: height - 150 }, // 마이페이지 탭 아이콘 위치 근처
                duration: 1200,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(heartOpacity, {
                toValue: 0,
                duration: 1200,
                delay: 600,
                useNativeDriver: true,
            }),
        ]).start(() => setShowHeart(false));
    };

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

            if (res.data === true) {
                animateHeart();
                showToastMessage();
                // setShowModal(true);
            }
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
                router.back();
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
        <View style={{ flex: 1 }}>
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
                        <Button onPress={handleLikeToggle}
                            style={[
                                styles.button,
                                liked ? { backgroundColor: "#AA00FF" } : {},
                            ]}
                            label={liked === true ? "찜 해제하기" : liked === false ? "찜하기" : "로그인 후 이용해주세요"}
                            disabled={loadingLike || liked === null}>
                        </Button>
                    </>
                )}

                {/* 찜 완료 모달 */}
                {/* <Modal
                    visible={showModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>찜 완료 ✓</Text>
                            <Text style={styles.modalText}>해당 상품을 찜 목록에 추가하였습니다</Text>

                            <View style={styles.modalButtons}>
                                <Pressable
                                    style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={[styles.modalBtnText, { color: Colors.black }]}>
                                        닫기
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
                                    onPress={() => {
                                        setShowModal(false);
                                        router.push("/(app)/(tabs)/mypage");
                                    }}
                                >
                                    <Text style={styles.modalBtnText}>마이페이지로 이동</Text>
                                </Pressable>

                            </View>
                        </View>
                    </View>
                </Modal> */}

            </SafeAreaView>

            {/* 하트 애니메이션 */}
            {showHeart && (
                <Modal transparent visible>
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <Animated.Image
                            source={require("@/assets/icon/pinkHeart.png")} // 너가 준 하트 이미지
                            style={{
                                position: "absolute",
                                width: 100,
                                height: 100,
                                transform: [
                                    { translateX: heartPos.x },
                                    { translateY: heartPos.y },
                                    { scale: heartScale },
                                ],
                                opacity: heartOpacity,
                            }}
                            resizeMode="contain"
                        />
                    </View>
                </Modal>
            )
            }
            {/* 찜 완료 토스트 */}
            {showToast && (
                <Animated.View
                    style={[
                        styles.toastOverlay,
                        { opacity: toastOpacity }
                    ]}
                    pointerEvents="none"
                >
                    <View style={styles.toastBox}>
                        <Text style={styles.toastText}>찜 완료 ✓</Text>
                        <Text style={{ fontFamily: "BasicMedium", fontSize: 12, color: Colors.black, marginTop: 10 }}>마이페이지에서 확인하세요</Text>
                    </View>
                </Animated.View>
            )}
        </View>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalBox: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingVertical: 24,
        paddingHorizontal: 20,
        width: "100%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "BasicBold",
        color: '#3BAE14',
        marginBottom: 20,
    },
    modalText: {
        fontSize: 14,
        fontFamily: "BasicMedium",
        color: Colors.black,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 12,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    modalBtnText: {
        fontSize: 14,
        fontFamily: "BasicMedium",
        color: Colors.white,
    },
    toastOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 100, // 탭 위쪽 정도
    },
    toastBox: {
        backgroundColor: Colors.white,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    toastText: {
        fontSize: 16,
        fontFamily: "BasicBold",
        color: Colors.primary,
        textAlign: "center",
    },
});