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
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null); // 터치 시 인터페이스 유지
    const [scrollX, setScrollX] = useState(0); // 스크롤 상태 저장해야 툴팁 위치 고정 가능

    if (!data || data.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.empty}>그래프 데이터 없음</Text>
            </View>
        );
    }

    const baseDate = "2025-09-01"; // 기준일

    // 기간별 시작일 계산
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

    // 기준 initprice (선택기간 첫날의 가격)
    const basePrice = useMemo(() => {
        return filteredData.length > 0
            ? filteredData[0].initPrice
            : data[0].initPrice;
    }, [filteredData, data]);

    // 누적 수익률
    const chartData = useMemo(() => {
        return filteredData.map((d, idx) => {
            const date = new Date(d.date);
            const monthLabel = `${date.getMonth() + 1}월`; // 0-based → +1
            const cumReturn = ((d.initPrice - basePrice) / basePrice) * 100;
            return {
                value: Number(cumReturn.toFixed(2)),
                label: monthLabel,
                date: d.date,
                initPrice: d.initPrice,
                index: idx,
                // labelComponent: () => (
                //     <Text
                //         style={{
                //             position: "absolute",
                //             top: -20,
                //             fontSize: 10,
                //             color: Colors.black,
                //             textAlign: "center",
                //             width: 40,
                //         }}
                //     >
                //         {monthLabel}
                //     </Text>
                // ),
            };
        });
    }, [filteredData, basePrice]);

    // y축 스케일링 (%)
    const yValues = chartData.map((d) => d.value);
    let minY = Math.min(...yValues);
    let maxY = Math.max(...yValues);

    // 0을 반드시 포함
    minY = Math.min(minY, 0);
    maxY = Math.max(maxY, 0);

    const rangeY = maxY - minY;

    // 범위 크기에 따른 step 자동 결정
    let step = 1;
    if (rangeY <= 5) step = 1;       // 좁은 구간 → 1%
    else if (rangeY <= 10) step = 2; // 중간 구간 → 2%
    else if (rangeY <= 30) step = 5; // 넓은 구간 → 5%  
    else if (rangeY <= 50) step = 10;// 더 넓은 구간 → 10%
    else step = 20;                  // 극단적 구간 → 20%

    // minY, maxY를 step 단위로 맞춤
    minY = Math.floor(minY / step) * step;
    maxY = Math.ceil(maxY / step) * step;

    // y축 라벨 생성
    const yAxisLabelTexts: string[] = [];
    for (let y = minY; y <= maxY; y += step) {
        yAxisLabelTexts.push(`${y}`);
    }


    // const yAxisLabelTexts: string[] = [];
    // for (let y = Math.floor(minY / step) * step; y <= Math.ceil(maxY / step) * step; y += step) {
    //     yAxisLabelTexts.push(Number(y.toFixed(2)).toString());
    // }

    // --- x축 spacing 계산 (항상 마지막 데이터가 맨 끝에 오도록)
    const screenWidth = Dimensions.get("window").width;

    const monthCount =
        month === "1M" ? 1 :
            month === "3M" ? 3 :
                month === "6M" ? 6 :
                    month === "1Y" ? 12 :
                        new Date(baseDate).getMonth() + 1; // YTD (1월부터 현재까지 개월 수)

    // 총 간격 = 화면 폭
    const spacing = useMemo(() => {
        return screenWidth / (monthCount - 1 || 1);
    }, [month, screenWidth]);

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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)} scrollEventThrottle={16}>
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
                    spacing={spacing} // 기간에 따라 spacing 반영
                    onFocus={(item: any) => {
                        setFocusedIndex(item.index);
                    }}
                />
            </ScrollView>

            {focusedPoint && (
                <>
                    {/* 툴팁 박스 */}
                    <View
                        style={[
                            styles.tooltip,
                            {
                                // stripX 좌표에서 scrollX 빼줌
                                left: Math.min(
                                    Math.max(0, 30 + focusedPoint.index * spacing - 50 - scrollX),
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
                </>
            )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 18,
        fontFamily: "BasicBold",
        marginBottom: 10,
        padding: 10,
        color: Colors.black,
    },
    empty: {
        fontSize: 12,
        color: Colors.gray,
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: 10,
    },
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
