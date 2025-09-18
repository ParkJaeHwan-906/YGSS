// app/(app)/(tabs)/irp/irp1.tsx

import { Colors } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import ListItem from "@/components/molecules/ListItem";
import React, { useEffect, useState, useRef, useMemo } from "react";
import Tab, { AssetGroup, CurrentTab } from "@/components/organisms/Tab";
import {
  fetchDcAll,
  fetchDcEtfs,
  fetchPensionFunds,
  fetchBond,
  normalizeDcToList,
  normalizeBondToList,
  type ListRow,
  type SortOrder,
} from "@/src/api/dc";


const PAGE_SIZE = 10;


export default function Irp1() {
  const router = useRouter();

  // 탭 상태
  const [group, setGroup] = useState<AssetGroup>("위험자산");
  const [tab, setTab] = useState<CurrentTab>("전체");
  const [sort, setSort] = useState<SortOrder>("desc");

  // 데이터 & 페이지 적용
  const [items, setItems] = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

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
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  
    // 리스트를 "처음 상태(10개)"로 복귀
    const buf = bufferRef.current ?? [];
    setItems(buf.slice(0, PAGE_SIZE));
    setPage(0);
    setHasMore(buf.length > PAGE_SIZE);
  
    // ‘더보기’ 플래그 초기화 & 버튼 숨김
    pressedMoreRef.current = false;
    setShowTop(false);
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* 상단 카드 */}
        <View style={styles.topContainer}>
          {/* 왼쪽 6 */}
          <View style={styles.colLeft}>
            <TouchableOpacity
              style={[styles.box, styles.boxLeft]}
              onPress={() => router.push("/irp/irp2")}
              activeOpacity={0.9}
            >
              <Text style={[styles.boxTitle, styles.boxTitleLight]}>IRP 상품 추천</Text>
              <Text style={[styles.boxDesc, styles.boxDescLight]}>
                나에게 꼭 맞는 상품은 뭘까?
              </Text>
              <Image source={require("@/assets/icon/pig.png")} style={styles.boxIcon} />
            </TouchableOpacity>
          </View>

          {/* 오른쪽 4 */}
          <View style={styles.colRight}>
            <TouchableOpacity
              style={[styles.box, styles.boxRight]}
              onPress={() => router.push("/irp/irp4")}
              activeOpacity={0.9}
            >
              <Text style={[styles.boxTitle, { color: Colors?.white ?? "#111" }]}>맞춤형 IRP 계좌</Text>
              <Text style={[styles.boxDesc, { color: Colors?.white ?? "#333" }]}>IRP 계좌 추천 받고, {"\n"}더욱 든든한 노후를 준비해요!</Text>
              <Image source={require("@/assets/icon/chart.png")} style={styles.boxIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 알키 설명 박스 */}
        <View style={styles.explainBox}>
          <View style={styles.alchiBox}>
            <Image
              source={require("@/assets/char/pointAlchi.png")}
              style={styles.alchiIcon}
            />
          </View>
        </View>

        {/* Tab 영역 */}
        <View style={{ marginTop: 16 }}>
          <Tab
            group={group}
            tab={tab}
            onGroupChange={setGroup}
            onTabChange={setTab}
            sortOrder={sort}
            onToggleSort={() => setSort(sort === "desc" ? "asc" : "desc")}
          />
        </View>

        {/* 리스트 영역 */}
        <View style={[styles.listContainer, { paddingHorizontal: 14, paddingVertical: 6 }]}>
          {loading ? (
            <Text style={{ padding: 16 }}>불러오는 중…</Text>
          ) : error ? (
            <Text style={{ padding: 16, color: "red" }}>{error}</Text>
          ) : items.length === 0 ? (
            <Text style={{ padding: 16, color: "#666" }}>표시할 항목이 없어요.</Text>
          ) : (
            // ✅ ListItem으로 렌더링
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
              // rateColorBy="risk" // 기본이 risk라 생략 가능
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
      </ScrollView>

      {/* ▼ 우하단 위로가기 FAB */}
      {showTop && (
        <TouchableOpacity style={styles.fab} onPress={handlePressToTop} activeOpacity={0.85}>
          <Text style={styles.fabText}>↑</Text>
        </TouchableOpacity>
      )}
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
    columnGap: 14,         // gap 이슈 피해서 columnGap 사용 (지원됨)
    flexWrap: "nowrap",
    alignItems: "stretch",
    marginTop: 30,
  },
  // ← 비율은 래퍼에게
  colLeft: { flex: 4 },
  colRight: { flex: 6 },

  // 카드 자체는 래퍼 너비를 100%로 채움
  box: {
    width: "100%",
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
  boxDesc: { color: Colors?.white ?? "#FFFFFF", fontFamily: "BasicMedium", fontSize: 12, lineHeight: 18 },
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
    height: 300,
    padding: 10,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  alchiBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  alchiIcon: {
    width: 240,
    height: 240,
    resizeMode: "contain",
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
    backgroundColor: Colors?.white ?? "#FFFFFF",
    borderRadius: 16,
  },
  moreHint: {
    marginTop: 8,
    borderRadius: 10,
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
