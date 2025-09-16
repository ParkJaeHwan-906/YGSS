// components/molecules/ProfitChart.tsx
import { Colors } from "@/src/theme/colors";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type PriceData = {
    date: string;
    initPrice: number;
    finalPrice: number;
    dailyRate: number;
};

export default function ProfitChart({ data }: { data: PriceData[] }) {
    if (!data || data.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.empty}>그래프 데이터 없음</Text>
            </View>
        );
    }

    // 기준일 (예: 2025-09-01)
    const baseDate = "2025-09-01";

    // 3개월 전 ~ 기준일까지 필터링
    const filteredData = useMemo(() => {
        const end = new Date(baseDate);
        const start = new Date(end);
        start.setMonth(end.getMonth() - 3); // 3개월 전

        return data.filter((d) => {
            const current = new Date(d.date);
            return current >= start && current <= end;
        });
    }, [data]);

    // 기준점 가격 = 구간 첫 initPrice
    const basePrice = useMemo(() => {
        return filteredData.length > 0 ? filteredData[0].initPrice : data[0].initPrice;
    }, [filteredData, data]);

    // 누적 수익률 계산 (모든 시점에서 initPrice 기준으로)
    const chartData = useMemo(() => {
        return filteredData.map((d) => {
            const cumReturn = ((d.initPrice / basePrice) - 1) * 100;
            return {
                value: Number(cumReturn.toFixed(2)),
                label: d.date.slice(2, 4) + "." + d.date.slice(5, 7), // 'MM-DD'
                labelComponent: () => (
                    <Text
                        style={{
                            position: "absolute",
                            top: -20,          // 그래프 위쪽으로 올리기
                            fontSize: 10,
                            color: Colors.black,
                            textAlign: "center",
                            width: 40,         // 글자 폭 보정
                        }}
                    >
                        {d.date.slice(5)}
                    </Text>
                ),
            };
        });
    }, [filteredData, basePrice]);

    // y축 스케일링
    const yValues = chartData.map((d) => d.value);
    let minY = Math.min(...yValues);
    let maxY = Math.max(...yValues);
    minY = Math.min(minY, 0);
    maxY = Math.max(maxY, 0);
    const range = maxY - minY;

    let step = 1;
    if (range <= 2) step = 0.5;
    else if (range <= 5) step = 1;
    else step = 5;

    const yAxisLabelTexts: string[] = [];
    for (
        let y = Math.floor(minY / step) * step;
        y <= Math.ceil(maxY / step) * step;
        y += step
    ) {
        yAxisLabelTexts.push(Number(y.toFixed(2)).toString());
    }

    // x축 스케일링
    const screenWidth = Dimensions.get("window").width - 60; // padding 고려
    const spacing = useMemo(() => {
        const n = filteredData.length;
        return screenWidth / (n > 1 ? n - 1 : 1);
    }, [filteredData]);


    return (
        <View style={styles.container}>
            <Text style={styles.title}>3개월 누적 수익률</Text>
            <Text style={{ fontFamily: "BasicMedium", fontSize: 10, color: Colors.black, alignSelf: "flex-end" }}>기준일 : {baseDate}</Text>
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

                /** 👇 포커스 관련 옵션 추가 */
                focusEnabled
                showDataPointOnFocus
                showStripOnFocus
                stripColor="rgba(46, 212, 207, 0.3)"   // 라인 색상
                stripWidth={1}                 // 라인 두께
                stripOpacity={1}               // 라인 투명도
                stripHeight={200}

                showReferenceLine1
                referenceLine1Position={0}
                referenceLine1Config={{ color: Colors.black, thickness: 1 }}
                adjustToWidth
                width={screenWidth}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 16,
        fontFamily: "BasicBold",
        marginBottom: 10,
        padding: 10,
        color: Colors.black,
    },
    empty: {
        fontSize: 12,
        color: Colors.gray,
    },
});
