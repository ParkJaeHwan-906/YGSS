// components/molecules/ProfitChart.tsx
import { Colors } from "@/src/theme/colors";
import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type PriceData = {
    date: string;
    initPrice: number;
    finalPrice: number;
    dailyRate: number;
};

type RangeType = "1M" | "3M" | "6M" | "1Y" | "YTD";
const RANGE_LABELS: Record<RangeType, string> = {
    "1M": "1개월",
    "3M": "3개월",
    "6M": "6개월",
    "1Y": "1년",
    "YTD": "연초 이후",
};

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

    const baseDate = data[data.length - 1].date; //마지막 데이터 기준일

    // 기간별 데이터 필터링
    const filteredData = useMemo(() => {
        const end = new Date(baseDate);
        const start = new Date(end);

        switch (month) {
            case "1M":
                start.setMonth(end.getMonth() - 1);
                break;
            case "3M":
                start.setMonth(end.getMonth() - 3);
                break;
            case "6M":
                start.setMonth(end.getMonth() - 6);
                break;
            case "1Y":
                start.setFullYear(end.getFullYear() - 1);
                break;
            case "YTD":
                start.setMonth(0);
                start.setDate(1);
                break;
        }

        return data.filter((d) => {
            const current = new Date(d.date);
            return current >= start && current <= end;
        });
    }, [data, month]);

    // 기준 initPrice (첫날)
    const basePrice = useMemo(() => {
        return filteredData.length > 0
            ? filteredData[0].initPrice
            : data[0].initPrice;
    }, [filteredData, data]);

    // 누적 수익률 (첫 점은 항상 0)
    const chartData = useMemo(() => {
        return filteredData.map((d, idx) => {
            const cumReturn =
                idx === 0 ? 0 : ((d.initPrice - basePrice) / basePrice) * 100;
            return {
                value: Number(cumReturn.toFixed(2)),
                date: d.date,
                initPrice: d.initPrice,
                index: idx,
            };
        });
    }, [filteredData, basePrice]);

    // x축 라벨: 점과 점 사이에 표시
    const xAxisLabels = useMemo(() => {
        return filteredData.map((d) => {
            const date = new Date(d.date);
            return `${date.getMonth() + 1}월`;
        });
    }, [filteredData]);

    // y축 스케일링
    const yValues = chartData.map((d) => d.value);
    let minY = Math.min(...yValues);
    let maxY = Math.max(...yValues);
    minY = Math.min(minY, 0);
    maxY = Math.max(maxY, 0);

    const rangeY = maxY - minY;
    let step = 1;
    if (rangeY <= 0.5) step = 0.1;       // 아주 좁은 구간
    else if (rangeY <= 1) step = 0.2;    // 좁은 구간
    else if (rangeY <= 5) step = 0.5;    // 소수점 단위
    else if (rangeY <= 10) step = 1;
    else if (rangeY <= 30) step = 2;
    else if (rangeY <= 50) step = 5;
    else step = 10;

    minY = Math.floor(minY / step) * step;
    maxY = Math.ceil(maxY / step) * step;

    const yAxisLabelTexts: string[] = [];
    for (let y = minY; y <= maxY; y += step) {
        yAxisLabelTexts.push(y.toFixed(1)); // 소수점 1자리 고정
    }

    // spacing 계산
    const screenWidth = Dimensions.get("window").width;
    const spacing = useMemo(() => {
        return chartData.length > 1
            ? screenWidth / (chartData.length - 1)
            : screenWidth;
    }, [chartData.length, screenWidth]);

    const focusedPoint =
        focusedIndex !== null ? chartData[focusedIndex] : null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>누적 수익률</Text>

            {/* 탭 버튼 */}
            <View style={styles.tabContainer}>
                {(Object.keys(RANGE_LABELS) as RangeType[]).map((key) => (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.tabButton,
                            month === key && styles.tabButtonActive,
                        ]}
                        onPress={() => setMonth(key)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                month === key && styles.tabTextActive,
                            ]}
                        >
                            {RANGE_LABELS[key]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text
                style={{
                    fontFamily: "BasicMedium",
                    fontSize: 10,
                    color: Colors.black,
                    marginRight: 10,
                    alignSelf: "flex-end",
                }}
            >
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
                    curved
                    thickness={2}
                    color={"#e74c3c"}
                    areaChart
                    height={200}
                    startFillColor={"rgba(231,76,60,0.25)"}
                    endFillColor={"rgba(231,76,60,0.05)"}
                    startOpacity={0.8}
                    endOpacity={0.05}
                    hideDataPoints
                    xAxisLabelTexts={xAxisLabels} // 구간 라벨 반영
                    xAxisLabelTextStyle={{ color: Colors.black, fontSize: 10 }}
                    yAxisTextStyle={{ color: Colors.black, fontSize: 10 }}
                    yAxisLabelWidth={40}
                    yAxisLabelTexts={yAxisLabelTexts}
                    hideRules={false}
                    rulesColor="#eee"
                    rulesType="solid"
                    focusEnabled
                    showDataPointOnFocus
                    showStripOnFocus
                    stripColor="rgba(30, 80, 244, 0.3)"
                    stripWidth={1}
                    stripOpacity={1}
                    stripHeight={200}
                    showReferenceLine1
                    referenceLine1Position={0}
                    referenceLine1Config={{ color: Colors.black, thickness: 1 }}
                    adjustToWidth
                    width={chartData.length * spacing}
                    spacing={spacing}
                    onFocus={(item: any) => {
                        setFocusedIndex(item.index);
                    }}
                />
            </ScrollView>

            {focusedPoint && (
                <View
                    style={[
                        styles.tooltip,
                        {
                            left: Math.min(
                                Math.max(
                                    0,
                                    30 + focusedPoint.index * spacing - 50 - scrollX
                                ),
                                screenWidth - 100
                            ),
                            top: 150,
                        },
                    ]}
                >
                    <Text style={styles.tooltipText}>{focusedPoint.date}</Text>
                    <Text style={styles.tooltipText}>
                        시장가: {focusedPoint.initPrice.toLocaleString()} KRW
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
