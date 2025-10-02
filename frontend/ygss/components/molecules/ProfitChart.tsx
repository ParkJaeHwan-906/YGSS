// components/molecules/ProfitChart.tsx
import { Colors } from "@/src/theme/colors";
import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type PriceData = {
    date: string;
    finalPrice: number;
};

type RangeType = "3M" | "6M" | "1Y" | "YTD";
const RANGE_LABELS: Record<RangeType, string> = {
    "3M": "3개월",
    "6M": "6개월",
    "1Y": "1년",
    "YTD": "연초 이후",
};

// === 예쁜 눈금 생성 ===
function niceTicks(min: number, max: number, maxTicks = 6) {
    if (!isFinite(min) || !isFinite(max)) {
        return { ticks: [0], niceMin: 0, niceMax: 0, step: 1 };
    }

    if (min === max) {
        if (min === 0) {
            min = -1;
            max = 1;
        } else {
            min *= 0.9;
            max *= 1.1;
        }
    }

    const range = max - min;
    const rawStep = range / Math.max(1, maxTicks - 1);
    const pow10 = Math.pow(10, Math.floor(Math.log10(Math.abs(rawStep))));
    const norm = rawStep / pow10;

    let stepNorm: number;
    if (norm <= 1) stepNorm = 1;
    else if (norm <= 2) stepNorm = 2;
    else if (norm <= 5) stepNorm = 5;
    else stepNorm = 10;

    const step = stepNorm * pow10;

    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;

    const ticks: number[] = [];
    for (let v = niceMin; v <= niceMax + 1e-9; v += step) {
        ticks.push(Number(v.toFixed(6))); // 부동소수 오차 방지
    }

    return { ticks, niceMin, niceMax, step };
}

const INITIAL_SPACING = 30;

export default function ProfitChart({ data }: { data: PriceData[] }) {
    const [month, setMonth] = useState<RangeType>("3M");
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [scrollX, setScrollX] = useState(0);

    if (!data || data.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.empty}>그래프 데이터 없음</Text>
            </View>
        );
    }

    // 마지막 인덱스가 기준일 (가장 최신 날짜를 기준으로)
    const baseDate = data[data.length - 1].date;

    // 기간 필터
    const filteredData = useMemo(() => {
        const end = new Date(baseDate); // 마지막 날짜
        const start = new Date(end); // 시작 날짜
        switch (month) {
            case "3M": start.setMonth(end.getMonth() - 3); break;
            case "6M": start.setMonth(end.getMonth() - 6); break;
            case "1Y": start.setFullYear(end.getFullYear() - 1); break;
            case "YTD": start.setMonth(0); start.setDate(1); break;
        }
        return data.filter((d) => {
            const cur = new Date(d.date); // 현재 날짜
            return cur >= start && cur <= end;
        });
    }, [data, month, baseDate]);

    if (!filteredData || filteredData.length < 2) {
        return (
            <View style={styles.container}>
                <Text style={styles.empty}>해당 기간의 그래프 데이터가 부족합니다</Text>
            </View>
        );
    }

    // === 누적 수익률 계산 ===
    const chartData = useMemo(() => {
        if (filteredData.length === 0) return [];
        // 첫 달의 종가
        const baseFinal = filteredData[0].finalPrice;

        return filteredData.map((d, idx) => {
            let pct = 0; // 첫 달은 0. 점 값
            if (idx > 0) {
                pct = ((d.finalPrice / baseFinal) - 1) * 100;
            }
            return {
                value: Number(pct.toFixed(2)), // 첫 달은 0, 점값. 소수점 둘째자리 까지
                date: d.date,
                finalPrice: d.finalPrice,
                index: idx,
            };
        });
    }, [filteredData]);

    // X축: 달이 바뀌는 첫 포인트만 라벨
    const xAxisLabels = useMemo(() => {
        return filteredData.map((d, i, arr) => {
            const cur = new Date(d.date);
            if (i === 0) return `${cur.getMonth() + 1}월`;
            const prev = new Date(arr[i - 1].date);
            return (prev.getMonth() !== cur.getMonth()) ? `${cur.getMonth() + 1}월` : "";
        });
    }, [filteredData]);

    // Y축 범위 계산
    const vals = chartData.map(d => d.value);
    let low = Math.min(...vals);
    let high = Math.max(...vals);

    // y축 표시 눈금(실제 데이터 값이 아닌 정제된 값. 17.89 -> 18)  
    const { ticks, niceMin, niceMax, step } = niceTicks(low, high, 6);
    const yAxisLabelTexts = [...ticks]
        .sort((a, b) => b - a) // 내림차순 정렬
        .map(v => `${v.toFixed(1)}%`);

    // spacing & 툴팁 좌표
    const screenWidth = Dimensions.get("window").width;
    const spacing = useMemo(() => {
        return chartData.length > 1 ? screenWidth / (chartData.length - 1) : screenWidth;
    }, [chartData.length, screenWidth]);

    const focusedPoint = focusedIndex !== null ? chartData[focusedIndex] : null;
    // const showZero = niceMin <= 0 && 0 <= niceMax; // 0이 범위 안에 있을 때만 0% 기준선

    return (
        <View style={styles.container}>
            <Text style={styles.title}>누적 수익률</Text>

            {/* 탭 */}
            <View style={styles.tabContainer}>
                {(Object.keys(RANGE_LABELS) as RangeType[]).map((key) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.tabButton, month === key && styles.tabButtonActive]}
                        onPress={() => setMonth(key)}
                    >
                        <Text style={[styles.tabText, month === key && styles.tabTextActive]}>
                            {RANGE_LABELS[key]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={{ fontFamily: "BasicMedium", fontSize: 10, color: Colors.black, marginRight: 10, alignSelf: "flex-end" }}>
                기준일 : {baseDate}
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
                scrollEventThrottle={16}
            >
                <LineChart
                    data={chartData}
                    curved={false}                 // overshoot 방지 (필요시 켤 수 있음)
                    thickness={2}
                    color={"#e74c3c"}
                    areaChart
                    height={200}
                    startFillColor={"rgba(231, 148, 148, 0.25)"}
                    endFillColor={"rgba(255, 87, 71, 0.05)"}
                    startOpacity={0.8}
                    endOpacity={0.05}
                    hideDataPoints

                    // === Y축: 수동 강제(라벨·스케일 동기화). suffix 사용 안 함.
                    // yAxisLabelTexts={yAxisLabelTexts} // 라벨 텍스트
                    noOfSections={yAxisLabelTexts.length - 1} // 눈금 개수
                    yAxisTextStyle={{ color: Colors.black, fontSize: 10 }}
                    yAxisLabelWidth={44}
                    yAxisLabelSuffix="%"
                    minValue={niceMin}            // v1.4.64: min/max 사용
                    maxValue={niceMax}

                    // X축 라벨
                    xAxisLabelTexts={xAxisLabels}
                    xAxisLabelTextStyle={{ color: Colors.black, fontSize: 10 }}

                    hideRules={false}
                    rulesColor="#eee"
                    rulesType="solid"

                    // 0% 기준선(범위 안에 있을 때만)
                    showReferenceLine1={niceMin <= 0 && 0 <= niceMax}
                    referenceLine1Position={0}
                    referenceLine1Config={{ color: Colors.black, thickness: 1 }}

                    // 가로 스크롤과 충돌 방지: adjustToWidth 미사용
                    initialSpacing={INITIAL_SPACING}
                    width={chartData.length * spacing}
                    spacing={spacing}

                    focusEnabled
                    showDataPointOnFocus
                    showStripOnFocus
                    stripColor="rgba(30, 80, 244, 0.3)"
                    stripWidth={1}
                    stripOpacity={1}
                    stripHeight={200}
                    onFocus={(item: any) => setFocusedIndex(item.index)}
                />
            </ScrollView>

            {focusedPoint && (
                <View
                    style={[
                        styles.tooltip,
                        {
                            left: Math.min(
                                Math.max(0, INITIAL_SPACING + focusedPoint.index * spacing - 50 - scrollX),
                                screenWidth - 100
                            ),
                            top: 150,
                        },
                    ]}
                >
                    <Text style={styles.tooltipText}>{focusedPoint.date}</Text>
                    <Text style={styles.tooltipText}>
                        종가: {focusedPoint.finalPrice.toLocaleString()} KRW
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center" },
    title: {
        fontSize: 18,
        fontFamily: "BasicBold",
        marginBottom: 10,
        padding: 10,
        color: Colors.black,
    },
    empty: { fontSize: 12, color: Colors.gray },
    tabContainer: { flexDirection: "row", marginBottom: 10 },
    tabButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.gray,
        backgroundColor: "#fff",
    },
    tabButtonActive: {
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    tabText: {
        fontSize: 12,
        color: Colors.gray,
        fontFamily: "BasicMedium",
    },
    tabTextActive: {
        color: Colors.primary,
        fontFamily: "BasicBold",
    },
    tooltip: {
        position: "absolute",
        top: 150,
        padding: 8,
        borderRadius: 6,
        backgroundColor: Colors.black,
        opacity: 0.7,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tooltipText: {
        fontSize: 12,
        color: Colors.white,
        fontFamily: "BasicMedium",
    },
});
