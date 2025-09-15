// components/molecules/ProfitChart.tsx
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type ApiResponse = {
    date: string;       // "YYYY-MM-DD"
    initPrice: number;
    finalPrice: number;
    dailyRate: number;
};

const TABS = ["1M", "3M", "6M", "12M", "YTD"];
const SECTIONS = 4;       // Y축 구간 수
const CHART_HEIGHT = 220; // 탭마다 동일한 높이
const PADDING_H = 16;     // 좌우 컨테이너 padding(부모와 일치)

const toDate = (str: string) => {
    const [y, m, d] = str.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
};

export default function ProfitChart({ data }: { data: ApiResponse[] }) {
    const [activeTab, setActiveTab] = useState("1M");
    const { width: winWidth } = useWindowDimensions();
    const chartWidth = Math.max(0, winWidth - PADDING_H * 2); // 화면 가로에 ‘딱’ 맞춤

    // 안전하게 정렬(보장용)
    const sorted = useMemo(
        () => [...data].sort((a, b) => (a.date < b.date ? -1 : 1)),
        [data]
    );

    // 기준일 = 응답 마지막 날짜
    const baseDate = toDate(sorted[sorted.length - 1].date);

    // 시작일 계산
    const getStartDate = (tab: string) => {
        const start = new Date(baseDate);
        switch (tab) {
            case "1M": start.setMonth(start.getMonth() - 1); break;
            case "3M": start.setMonth(start.getMonth() - 3); break;
            case "6M": start.setMonth(start.getMonth() - 6); break;
            case "12M": start.setFullYear(start.getFullYear() - 1); break; // 정확히 1년 전 같은 날짜
            case "YTD": return new Date(baseDate.getFullYear(), 0, 1);
            default: start.setMonth(start.getMonth() - 1);
        }
        return start;
    };

    // 기간 필터 + 누적 수익률(소수) + X축 라벨 간소화
    const filteredData = useMemo(() => {
        const start = getStartDate(activeTab);
        const selected = sorted.filter(d => {
            const dd = toDate(d.date);
            return dd >= start && dd <= baseDate;
        });
        if (selected.length === 0) return [];

        const basePrice = selected[0].finalPrice;
        // X축 라벨 과밀 방지(대략 6개만 노출)
        const labelStep = Math.max(1, Math.floor(selected.length / 6));

        return selected.map((d, i) => {
            const dd = toDate(d.date);
            const rate = (d.finalPrice / basePrice) - 1; // 0.05 = 5%
            const showLabel = i === 0 || i % labelStep === 0 || i === selected.length - 1;
            return {
                value: rate,
                label: showLabel ? `${dd.getMonth() + 1}/${dd.getDate()}` : "",
            };
        });
    }, [activeTab, sorted]);

    // Y축 스케일(소수, 둘째 자리 고정) + 변동폭 작으면 확대
    const yValues = filteredData.map(d => d.value);
    let minValue = Math.min(...yValues);
    let maxValue = Math.max(...yValues);

    // 변동폭 최소 확보(1M 직선화 방지) : 최소 20% 범위
    const MIN_SPAN = 0.2;
    let span = maxValue - minValue;
    if (!isFinite(span) || span < MIN_SPAN) {
        const mid = isFinite(minValue + maxValue) ? (maxValue + minValue) / 2 : 0;
        minValue = mid - MIN_SPAN / 2;
        maxValue = mid + MIN_SPAN / 2;
        span = MIN_SPAN;
    }

    // 위/아래 여백(그래프가 경계에 붙지 않도록)
    const yPadding = Math.max(span * 0.1, 0.01);
    const yMin = minValue - yPadding;
    const yMax = maxValue + yPadding;

    // Y축 라벨 텍스트(항상 소수 둘째 자리)
    const yAxisLabelTexts = Array.from({ length: SECTIONS + 1 }, (_, i) => {
        const v = yMin + ((yMax - yMin) * i) / SECTIONS;
        return v.toFixed(2); // ✅ 두 자리 고정
    });

    // X축: 스크롤 없이 화면 폭에 꽉 차게 + 첫 라벨 안 잘림 + 마지막 점은 오른쪽 끝
    const n = filteredData.length;
    const leftPad = 12;  // 첫 라벨 잘림 방지
    const rightPad = 0;  // 기준일(마지막 점) 오른쪽 끝 고정
    const spacing =
        n > 1 ? (chartWidth - leftPad - rightPad) / (n - 1) : chartWidth - leftPad - rightPad;

    return (
        <View style={styles.container}>
            {/* 탭 */}
            <View style={styles.tabContainer}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={{ color: activeTab === tab ? "#fff" : "#333" }}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 차트 */}
            <LineChart
                data={filteredData}
                width={chartWidth}        // ✅ 스크롤 없음
                height={CHART_HEIGHT}     // ✅ 탭마다 동일 높이
                spacing={spacing}         // ✅ 데이터 개수에 맞춰 정확 분배
                initialSpacing={leftPad}  // ✅ 첫 라벨 안 잘림
                endSpacing={rightPad}     // ✅ 마지막 점(기준일) 오른쪽 끝

                // 샘플 스타일 반영
                curved
                hideDataPoints
                thickness={5}
                hideRules
                showVerticalLines
                verticalLinesColor="rgba(14,164,164,0.25)"
                yAxisColor="#0BA5A4"
                xAxisColor="#0BA5A4"
                color="#0BA5A4"

                // Y축(둘째 자리 고정)
                noOfSections={SECTIONS}
                yAxisLabel=""
                yAxisTextStyle={{ color: "#999" }}
                yAxisLabelTexts={yAxisLabelTexts}
                yAxisTextNumberOfTicks={SECTIONS + 1}
                minValue={yMin}
                maxValue={yMax}

                // X축
                xAxisLabelTextStyle={{ color: "#999" }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: PADDING_H, paddingTop: 16, paddingBottom: 12 },
    tabContainer: { flexDirection: "row", marginBottom: 12 },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: "#eee",
        marginRight: 8,
    },
    activeTab: { backgroundColor: "#FF6B6B" },
});
