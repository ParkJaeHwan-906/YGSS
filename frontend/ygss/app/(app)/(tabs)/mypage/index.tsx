// app/(app)/(tabs)/mypage/index.tsx
import InvestChar, { Slice } from "@/components/molecules/InvestChar";
import MyMoney from "@/components/molecules/MyMoney";
import ImageList, { ImageListData } from "@/components/organisms/ImageList";
import PasswordConfirmModal from "@/components/organisms/PasswordConfirmModal";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setUser, signOut } from "@/src/store/slices/authSlice";
import { Colors } from "@/src/theme/colors";
import { deleteRefreshToken } from "@/src/utils/secureStore";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function Mypage() {
    const router = useRouter();
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user);
    const accessToken = useAppSelector((s) => s.auth.accessToken);

    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);
    const [likedItems, setLikedItems] = useState<ImageListData[]>([]);
    const [showTop, setShowTop] = useState(false); // top버튼
    const [slices, setSlices] = useState<Slice[]>([]);

    const scrollRef = useRef<ScrollView>(null);

    const handleLogout = useCallback(async () => {
        try { await deleteRefreshToken().catch(() => { }); }
        finally {
            dispatch(signOut());       // 1) 전역 auth 먼저 끊고
            setLikedItems([]);         // 2) 로컬 UI도 즉시 비우고
            setSlices([]);
            router.replace("/(auth)/login"); // 3) 마지막에 이동
        }
    }, [dispatch, router]);

    // 페이지 진입 시 유저 정보 다시 불러오기
    useFocusEffect(
        useCallback(() => {
            const fetchUser = async () => {
                try {
                    const { data } = await axios.get(`${API_URL}/user/load/detail`, {
                        headers: { Authorization: `A103 ${accessToken}` },
                    });
                    dispatch(setUser(data));
                } catch (err) {
                    console.error("유저 정보 갱신 실패", err);
                }
            };

            if (accessToken) fetchUser();

            // 포커스 빠질 때 cleanup 필요하면 return에 넣기
            return () => { };
        }, [accessToken])
    );

    //  찜한 상품 불러오기 함수
    const fetchLiked = useCallback(
        async (signal: AbortSignal) => {
            if (!accessToken) return;

            try {
                const res = await axios.get(`${API_URL}/pension/liked-product`, {
                    headers: { Authorization: `A103 ${accessToken}` },
                    signal,
                });

                const { likedProduct = [], likedBond = [] } = res.data;

                // ETF, 펀드, 채권 개수
                const etfCount = likedProduct.filter((it: any) => it.productTypeName === "ETF").length;
                const fundCount = likedProduct.filter((it: any) => it.productTypeName === "펀드").length;
                const bondCount = likedBond.length;

                // slices 세팅 (개수 기준)
                const mappedSlices: Slice[] = [];
                if (etfCount > 0) mappedSlices.push({ label: "ETF", amount: etfCount });
                if (fundCount > 0) mappedSlices.push({ label: "펀드", amount: fundCount });
                if (bondCount > 0) mappedSlices.push({ label: "채권", amount: bondCount });
                setSlices(mappedSlices);

                // 상품 리스트 매핑
                const mapped: ImageListData[] = [
                    ...likedProduct.map((it: any) => ({
                        id: it.id,
                        type: it.productTypeName,
                        logo: it.productTypeName === "ETF"
                            ? require("@/assets/icon/etf.png")
                            : require("@/assets/icon/fund.png"),
                        title: it.product,
                        subTitle: it.companyName,
                        rate: it.nextYearProfitRate ?? 0,
                    })),
                    ...likedBond.map((it: any) => ({
                        id: it.id,
                        type: "BOND",
                        logo: require("@/assets/icon/bond.png"),
                        title: it.productName,
                        subTitle: it.publisher,
                        rate: it.finalProfitRate ?? 0,
                    })),
                ];
                setLikedItems(mapped);

            } catch (err: any) {
                if (err.name === "CanceledError" || err.name === "AbortError") return;
                console.error("찜한 상품 조회 실패:", err.response?.status, err.message);
                setSlices([]); setLikedItems([]);
            }
        }, [accessToken]);

    // 최초 마운트 시 1번
    useEffect(() => {
        if (!accessToken) {
            setSlices([]);
            setLikedItems([]);
            return;
        }
        const controller = new AbortController();
        fetchLiked(controller.signal);
        return () => controller.abort();   // 실제 cleanup
    }, [fetchLiked, accessToken]);

    // 마이페이지로 들어올 때마다 실행
    useFocusEffect(
        useCallback(() => {
            if (!accessToken) return;
            const controller = new AbortController();
            fetchLiked(controller.signal);
            return () => controller.abort(); // 포커스 해제 시 취소
        }, [fetchLiked, accessToken])
    );

    // 최상단 이동 핸들러
    const handlePressToTop = () => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                onScroll={(e) => {
                    const offsetY = e.nativeEvent.contentOffset.y;
                    setShowTop(offsetY > 300);
                }}
                scrollEventThrottle={16} // 스크롤 이벤트 빈도
            >

                {/* 상단 프로필 이동 버튼 */}
                <Pressable
                    onPress={() => setModalVisible(true)}
                    style={styles.profileButton}
                >
                    <Text style={styles.profileName}>{user?.name}  </Text>
                    <Ionicons name="chevron-forward-outline" size={22} color="#333" />
                </Pressable>

                <Pressable style={styles.moneyContainer}>
                    {/* 내 자산 현황 */}
                    {user?.totalRetirePension !== null && user?.totalRetirePension !== undefined && (
                        <MyMoney
                            amount={user.totalRetirePension}
                            from="mypage"
                            wrapHeight={140}
                            fontSize={16}
                            gap={-8}
                        // rate={0} // TODO: 실제 수익률 값으로 교체 필요
                        />
                    )}
                </Pressable>
                {/* 비밀번호 확인 모달 */}
                <PasswordConfirmModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSuccess={() => router.push("/mypage/modify")}
                />
                {/* <찜상품 비중 /> */}
                <View style={{ marginBottom: 10 }}>
                    <InvestChar slices={slices} />
                </View>

                {/* 찜 상품 */}
                <ImageList items={likedItems} initialCount={3} step={5} header="나의 찜 상품" emptyText="찜한 상품이 없습니다." from="mypage" />

                {/* 로그아웃 버튼 */}
                <Pressable onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>로그아웃</Text>
                </Pressable>

            </ScrollView >
            {showTop && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handlePressToTop}
                    activeOpacity={0.85}
                >
                    <Text style={styles.fabText}>↑</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.back,
    },
    moneyContainer: {
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    profileButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
        alignSelf: "flex-start",
        paddingLeft: 16,
    },
    profileName: {
        fontSize: 22,
        fontFamily: "BasicBold"
    },
    profileArrow: {
        fontSize: 18,
        marginLeft: 4,
    },
    logoutButton: {
        marginTop: 30,
        alignSelf: "center", // 가운데 정렬
        marginBottom: 20,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: "BasicLight",
        color: Colors.black,
        textDecorationLine: "underline", // 밑줄
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 40,
        backgroundColor: Colors.primary,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
    fabText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
