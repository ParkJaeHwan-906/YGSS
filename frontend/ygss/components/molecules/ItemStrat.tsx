import { Colors } from "@/src/theme/colors";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

type Strategy = {
    category: string;
    percentage: number;
};

export default function ItemStrat({ data }: { data: Strategy[] }) {
    if (!data || data.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>투자전략</Text>
                <Text style={styles.empty}>데이터가 없습니다</Text>
            </View>
        );
    }

    // 색상 매핑
    const colors: string[] = ["#5465FF", "#9BB1FF", "#BFD7FF", "#EEF1FF"];

    const screenWidth = Dimensions.get("window").width - 32;
    const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;

    // 각 블록의 애니메이션 종료 여부 상태
    const [finished, setFinished] = useState<boolean[]>(
        Array(data.length).fill(false)
    );

    useEffect(() => {
        const animations = data.map((item, idx) =>
            Animated.timing(animatedValues[idx], {
                toValue: (screenWidth * item.percentage) / 100,
                duration: 1000,
                useNativeDriver: false,
            })
        );

        // 순차 실행 + 각 animation 끝나면 finished[idx] 갱신
        animations.forEach((anim, idx) => {
            anim.start(() => {
                setFinished((prev) => {
                    const copy = [...prev];
                    copy[idx] = true;
                    return copy;
                });
            });
        });
    }, [data]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>투자전략 (%)</Text>

            {/* 가로 ProgressBar */}
            <View style={styles.barWrap}>
                {data.map((item, idx) => {
                    const bgColor = colors[idx] || "#EEF1FF";
                    const textColor = bgColor === "#EEF1FF" ? "#ACACAC" : Colors.white;

                    return (
                        <Animated.View
                            key={idx}
                            style={[
                                styles.block,
                                {
                                    backgroundColor: bgColor,
                                    width: animatedValues[idx],
                                },
                            ]}
                        >
                            {finished[idx] && (
                                <Text style={[styles.percent, { color: textColor }]}>
                                    {item.percentage.toFixed(0)}
                                </Text>
                            )}
                        </Animated.View>
                    );
                })}
            </View>

            {/* 범례 */}
            <View style={styles.legendWrap}>
                {data.map((item, idx) => (
                    <View key={idx} style={styles.legendItem}>
                        <View
                            style={[
                                styles.legendColor,
                                { backgroundColor: colors[idx] || "#EEF1FF" },
                            ]}
                        />
                        <Text style={styles.legendText}>{item.category}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: {
        fontSize: 18,
        fontFamily: "BasicBold",
        marginBottom: 12,
    },
    empty: {
        fontSize: 14,
        color: Colors.gray,
        fontFamily: "BasicMedium",
    },
    barWrap: {
        flexDirection: "row",
        height: 32,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
    },
    block: {
        justifyContent: "center",
        alignItems: "center",
    },
    percent: {
        fontSize: 12,
        fontFamily: "BasicBold",
        color: Colors.white,
    },
    legendWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 10,
        fontFamily: "BasicMedium",
        color: Colors.gray,
    },
});
