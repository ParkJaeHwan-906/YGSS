// app/(app)/(tabs)/irp/irp1.tsx

import Dict from "@/components/molecules/Dict";
import ListItem from "@/components/molecules/ListItem";
import CustomAlert from "@/components/organisms/CustomAlert";
import Tab, { AssetGroup, CurrentTab } from "@/components/organisms/Tab";
import {
  fetchBond,
  fetchDcAll,
  fetchDcEtfs,
  fetchPensionFunds,
  normalizeBondToList,
  normalizeDcToList,
  type ListRow,
  type SortOrder,
} from "@/src/api/dc";
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import { getIrpBubbleText } from "@/src/utils/getIrpBubble";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  InteractionManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 10;


export default function Irp1() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  // 탭 상태
  const [group, setGroup] = useState<AssetGroup>("위험자산");
  const [tab, setTab] = useState<CurrentTab>("전체");
  const [sort, setSort] = useState<SortOrder>("desc");
  const listHeight = useRef(0);

  // 데이터 & 페이지 적용
  const [items, setItems] = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // alert
  const [alertVisible, setAlertVisible] = useState(false);

  const bufferRef = useRef<ListRow[]>([]);

  const apiKey = useMemo(() => {
    if (group === "안전자산") return "BOND";
    if (tab === "ETF") return "ETF";
    if (tab === "펀드") return "FUND";
    return "ALL";
  }, [group, tab]);

  // 스크롤 상태 추가
  const scrollRef = useRef<ScrollView>(null);
  const [showTop, setShowTop] = useState(false);
  const pressedMoreRef = useRef(false);

  // 말풍선 상태
  const [hasInteracted, setHasInteracted] = useState(false);
  const dictKey = `${group}-${tab}-${hasInteracted ? 1 : 0}`;

  // 탭 변화 감지
  const handleGroupChange = (g: AssetGroup) => {
    setGroup(g);
    setHasInteracted(true);
  };

  const handleTabChange = (t: CurrentTab) => {
    setTab(t);
    setHasInteracted(true);
  };

  const bubble = useMemo(
    () => getIrpBubbleText(hasInteracted, group, tab),
    [hasInteracted, group, tab]
  );

  // 스크롤 핸들러
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;

    // 일정 이상 내려가면 표시 (예: 400px)
    if (y > 400 && !showTop) setShowTop(true);
    // 충분히 위로 올라오면 숨김 (단, '더보기'를 누른 적이 없을 때만 자동 숨김)
    if (y <= 150 && showTop && !pressedMoreRef.current) setShowTop(false);
  };


  // 초기 로드(상태 변경 시 1회 요청하여 버퍼 채우고 첫 10개 세팅)
  const fetchInitial = async () => {
    try {
      setLoading(true);
      setError(null);

      let list: ListRow[] = [];
      if (apiKey === "BOND") {
        const rows = await fetchBond(sort);
        list = normalizeBondToList(rows);
      } else if (apiKey === "ETF") {
        const rows = await fetchDcEtfs(sort);
        list = normalizeDcToList(rows, "ETF");
      } else if (apiKey === "FUND") {
        const rows = await fetchPensionFunds(sort);
        list = normalizeDcToList(rows, "FUND");
      } else {
        const rows = await fetchDcAll(sort);
        list = normalizeDcToList(rows, "ALL");
      }

      bufferRef.current = list;                  // 전체 보관
      setItems(list.slice(0, PAGE_SIZE));        // 첫 10개 표시
      setPage(0);
      setHasMore(list.length > PAGE_SIZE);
    } catch (e: any) {
      setError(e?.response?.status ? `요청 실패 (${e.response.status})` : (e?.message ?? "네트워크/서버 오류"));
      bufferRef.current = [];
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 상태가 바뀔 때마다 초기 10개만 표시
  useEffect(() => {
    fetchInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, tab, sort]);

  // 🔹 “더 보기” 버튼 클릭 → 버퍼에서 다음 10개 append
  const loadMore = () => {
    if (loading || !hasMore) return;
    const buf = bufferRef.current ?? [];
    const nextPage = page + 1;
    const start = nextPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const slice = buf.slice(start, end);

    if (slice.length === 0) {
      setHasMore(false);
      return;
    }

    setItems((prev) => [...prev, ...slice]);
    setPage(nextPage);
    setHasMore(end < buf.length);

    // 버튼 누를 시, top 버튼 생성
    pressedMoreRef.current = true;
    setShowTop(true);
  };

  // 최상단 이동 핸들러
  const handlePressToTop = () => {
    // 스크롤 맨 위로
    scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });

    // 리스트를 "처음 상태(10개)"로 복귀
    InteractionManager.runAfterInteractions(() => {
      const buf = bufferRef.current ?? [];
      setItems(buf.slice(0, PAGE_SIZE));
      setPage(0);
      setHasMore(buf.length > PAGE_SIZE);
      pressedMoreRef.current = false;
      setShowTop(false);
    });
  };


  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, flexGrow: 1 }}
      >
        {/* 상단 카드 */}
        <View style={styles.topContainer}>
          {/* 왼쪽 6 */}
          <View style={styles.colLeft}>

            {/* --- 잠시 막아두기 */}
            <TouchableOpacity
              style={[styles.box, styles.boxLeft]}
              onPress={() => {
                if (user) {
                  router.push("/irp/irp2")
                } else {
                  setAlertVisible(true)
                }
              }}
              activeOpacity={0.9}
            >
              <Text style={[styles.boxTitle, styles.boxTitleLight]}>IRP 상품 추천</Text>
              <Text style={[styles.boxDesc, styles.boxDescLight]}>
                나에게 꼭 맞는 상품은 뭘까?
              </Text>
              <Image source={require("@/assets/icon/pig.png")} style={styles.boxIcon} />
            </TouchableOpacity>
          </View>

          <View style={{ width: 14 }} />

          {/* 오른쪽 4 */}
          <View style={styles.colRight}>
            <TouchableOpacity
              style={[styles.box, styles.boxRight]}
              onPress={() => {
                if (user) {
                  router.push("/irp/irp4")
                } else {
                  setAlertVisible(true)
                }
              }}
              activeOpacity={0.9}
            >
              <Text style={[styles.boxTitle, { color: Colors?.white ?? "#111" }]}>IRP 예측 수익률</Text>
              <Text style={[styles.boxDesc, { color: Colors?.white ?? "#333" }]}>IRP 월 납입금으로,{"\n"}예상 수익률을 확인해보세요! </Text>
              <Image source={require("@/assets/icon/chart.png")} style={styles.boxIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 알키 설명 박스 */}
        <View style={styles.explainBox}>
          <View style={styles.alchiBox}>
            {/* 말풍선 */}
            <View style={styles.dictBox}>
              <MotiView
                key={dictKey}
                from={{ opacity: 0, rotateZ: "-2deg", translateY: 8 }}
                animate={{ opacity: 1, rotateZ: "0deg", translateY: 0 }}
                transition={{ type: "spring", damping: 18, stiffness: 200 }}
                style={styles.dictBox}
              >
                <Dict
                  title={bubble.title}
                  desc={bubble.desc}
                  style={{ width: 300, minHeight: 120 }}
                />
              </MotiView>
            </View>
            {/* 캐릭터 */}
            <Image
              source={require("@/assets/char/pointAlchi.png")}
              style={styles.alchiIcon}
            />
          </View>
        </View>

        {/* Tab 영역 */}
        <View style={{ marginTop: 10 }}>
          <Tab
            group={group}
            tab={tab}
            onGroupChange={handleGroupChange}
            onTabChange={handleTabChange}
            sortOrder={sort}
            onToggleSort={() => setSort(sort === "desc" ? "asc" : "desc")}
          />
        </View>

        {/* 리스트 영역 */}
        <View style={{ flexGrow: 1 }}>
          <View
            style={[styles.listContainer, { marginBottom: -20 }]}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (!loading && !error && items.length > 0) {
                listHeight.current = h;
              }
            }}
          >
            {loading ? (
              <View style={{ minHeight: listHeight.current || 300, justifyContent: "center" }}>
                <Text style={{ padding: 16 }}>불러오는 중…</Text>
              </View>
            ) : error ? (
              <Text style={{ padding: 16, color: "red" }}>{error}</Text>
            ) : items.length === 0 ? (
              <Text style={{ padding: 16, color: "#666" }}>표시할 항목이 없어요.</Text>
            ) : (
              items.map((it) => {
                const destPath = it.kind === "BOND" ? "/dc/bond/[id]" : "/dc/etf_fund/[id]";

                return (
                  <ListItem
                    key={String(it.id)}
                    title={it.title}
                    subTitle={it.subTitle}
                    rate={it.rate}
                    risk={it.risk}
                    onPress={() =>
                      router.push({
                        pathname: destPath,
                        params: { id: String(it.id) },
                      })
                    }
                  />
                )
              })
            )}

            {/* 🔹 스크롤 힌트(더 보기) */}
            {hasMore && (
              <Pressable onPress={loadMore} style={styles.moreHint}>
                <Text style={styles.moreHintText}>더보기</Text>
              </Pressable>
            )}
            {!hasMore && (
              <View style={{ paddingVertical: 12, alignItems: "center" }}>
                <Text style={{ color: Colors?.gray ?? "#8A8A8E" }}>마지막 항목입니다</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ▼ 우하단 위로가기 FAB */}
      {showTop && (
        <TouchableOpacity style={styles.fab} onPress={handlePressToTop} activeOpacity={0.85}>
          <Text style={styles.fabText}>↑</Text>
        </TouchableOpacity>
      )}

      {/* 로그인 필요 alert */}
      <CustomAlert
        visible={alertVisible}
        title="로그인이 필요합니다"
        message="로그인 후 이용해주세요"
        onClose={() => setAlertVisible(false)}
      />

    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors?.back ?? "#F4F6FF",
  },
  container: {
    flex: 1,
    backgroundColor: Colors?.back ?? "#F4F6FF",
    padding: 16,
  },
  topContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "stretch",
    marginTop: 16,
  },
  // ← 비율은 래퍼에게
  colLeft: { flexGrow: 4, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  colRight: { flexGrow: 6, flexShrink: 1, flexBasis: 0, minWidth: 0 },

  box: {
    flex: 1,
    height: 160,
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  boxLeft: { backgroundColor: Colors?.white ?? "#4666FF" },
  boxRight: { backgroundColor: Colors?.primary ?? "#FFFFFF" },

  boxTitle: { fontFamily: "BasicBold", fontSize: 18, marginBottom: 6 },
  boxTitleLight: { color: Colors?.black, fontSize: 14 },
  boxDesc: { color: Colors?.white ?? "#FFFFFF", fontFamily: "BasicMedium", fontSize: 11, lineHeight: 18 },
  boxDescLight: { color: Colors?.black },
  boxIcon: {
    width: 56,
    height: 56,
    position: "absolute",
    right: 12,
    bottom: 12,
    resizeMode: "contain",
  },
  // 알키 설명 박스
  explainBox: {
    height: 400,
    padding: 10,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  alchiBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  dictBox: {
    width: "100%",
    alignSelf: "center",
    marginRight: 10,
    marginBottom: -30,
  },
  alchiIcon: {
    marginLeft: 160,
    width: 240,
    height: 240,
    resizeMode: "contain",
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
    marginHorizontal: -20,
    padding: 18,
    backgroundColor: Colors?.white ?? "#FFFFFF",
  },
  moreHint: {
    marginTop: 8,
    marginBottom: 10,
    borderColor: Colors?.gray ?? "#E5E7EB",
    backgroundColor: Colors?.white ?? "#FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  moreHintText: {
    fontFamily: "BasicMedium",
    fontSize: 14,
    color: Colors?.black ?? "#111827",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors?.primary ?? "#4666FF",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "BasicBold",
    lineHeight: 40,
  },
});