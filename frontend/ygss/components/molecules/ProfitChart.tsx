// components/molecules/ProfitChart.tsx
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type Point = { date: string | Date; price: number };
type Series = { id: string; color?: string; points: Point[] };
type Props = {
    datasets: Series[];     // 최대 3개까지 자동 매핑(data, data2, data3)
    height?: number;
};

type RangeKey = "YTD" | "1M" | "3M" | "6M" | "12M";
const RANGES: RangeKey[] = ["YTD", "1M", "3M", "6M", "12M"];

const toDate = (d: string | Date) => (d instanceof Date ? d : new Date(d));
const addMonths = (date: Date, m: number) => {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + m);
    if (d.getDate() < day) d.setDate(0);
    return d;
};
const fmtPct = (v: number) =>
    `${Math.round(v % 1 === 0 ? v : Math.round(v * 10) / 10)}%`; // 정수 위주, 소수점 1자리 보정

function sliceByRange(points: Point[], k: RangeKey): Point[] {
    if (!points.length) return [];
    const sorted = [...points].sort((a, b) => +toDate(a.date) - +toDate(b.date));
    const today = new Date(); // 현재 날짜 기준
    let start: Date;
    if (k === "YTD") start = new Date(today.getFullYear(), 0, 1);
    else if (k === "1M") start = addMonths(today, -1);
    else if (k === "3M") start = addMonths(today, -3);
    else if (k === "6M") start = addMonths(today, -6);
    else start = addMonths(today, -12);
    return sorted.filter((p) => {
        const d = toDate(p.date);
        return d >= start && d <= today;
    });
}

function toReturn(points: Point[]) {
    if (!points.length) return [];
    const base = points[0].price;
    return points.map((p) => ({
        value: ((p.price / base) - 1) * 100, // % 수익률
        date: toDate(p.date),
        label: "", // X축 라벨은 혼잡 방지용으로 별도 계산
    }));
}

function symmetricRange(all: { value: number }[][], sections = 6) {
    let min = 0, max = 0;
    all.forEach(arr =>
        arr.forEach(p => {
            if (p.value < min) min = p.value;
            if (p.value > max) max = p.value;
        })
    );
    const abs = Math.max(Math.abs(min), Math.abs(max), 4);
    const pad = Math.ceil(abs * 0.1);
    const bound = Math.ceil(abs + pad);
    const lo = -bound;
    const hi = bound;
    const step = (hi - lo) / sections;
    const labels = Array.from({ length: sections + 1 }, (_, i) =>
        fmtPct(Math.round((hi - i * step)))
    );
    return { min: lo, max: hi, labels, sections };
}

function buildXAxisLabels(series: { date: Date }[]) {
    // 간단하게 6개 라벨만 균등 추출
    if (!series.length) return [];
    const n = 6;
    return series.map((p, i) => {
        const every = Math.max(1, Math.floor(series.length / n));
        if (i % every === 0 || i === series.length - 1) {
            const d = p.date;
            return `${d.getMonth() + 1}/${d.getDate()}`;
        }
        return "";
    });
}

export default function ReturnLineChartGifted({ datasets, height = 240 }: Props) {
    const [range, setRange] = useState<RangeKey>("YTD");

    const prepared = useMemo(() => {
        const lines = datasets.slice(0, 3).map((s) => {
            const sliced = sliceByRange(s.points, range);
            const ret = toReturn(sliced);
            return { id: s.id, color: s.color, data: ret };
        });

        const { min, max, labels, sections } = symmetricRange(lines.map(l => l.data));
        const xLabels = buildXAxisLabels(lines[0]?.data ?? []);

        // x 라벨은 첫 번째 시리즈 기준으로만 보여준다(공통 X축)
        if (lines[0]?.data) {
            lines[0].data = lines[0].data.map((p, i) => ({ ...p, label: xLabels[i] ?? "" }));
        }

        return { lines, min, max, labels, sections };
    }, [datasets, range]);

    const [a, b, c] = prepared.lines;
    const hasAny = prepared.lines.some((l) => l.data.length > 1);

    return (
        <View style={styles.wrap}>
            {/* 구간 탭 */}
            <View style={styles.tabs}>
                {RANGES.map((r) => (
                    <Pressable
                        key={r}
                        onPress={() => setRange(r)}
                        style={[styles.tab, r === range && styles.tabActive]}
                    >
                        <Text style={[styles.tabText, r === range && styles.tabTextActive]}>
                            {r === "YTD" ? "연초이후" : r}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {!hasAny ? (
                <View style={styles.empty}><Text style={styles.emptyText}>표시할 데이터가 없습니다</Text></View>
            ) : (
                <LineChart
                    height={height}
                    data={a?.data ?? []}
                    data2={b?.data ?? undefined}
                    data3={c?.data ?? undefined}
                    color1={a?.color ?? "#06b6d4"}
                    color2={b?.color ?? "#ef4444"}
                    color3={c?.color ?? "#10b981"}
                    curved
                    hideDataPoints
                    thickness={2}
                    // 축/그리드
                    noOfSections={prepared.sections}
                    yAxisLabelTexts={prepared.labels}
                    yAxisTextStyle={{ color: "#6b7280", fontSize: 11 }}
                    yAxisLabelWidth={44}
                    xAxisLabelTextStyle={{ color: "#6b7280", fontSize: 10 }}
                    xAxisThickness={0}
                    yAxisThickness={0}
                    rulesColor="#e5e7eb"
                    rulesType="dashed"
                    // Y 범위 (대칭, 0 기준선 자연스럽게 중앙 근처)
                    mostNegativeValue={prepared.min}
                    maxValue={prepared.max}
                    yAxisOffset={prepared.min < 0 ? -prepared.min : 0}
                    // 상호작용 툴팁
                    pointerConfig={{
                        pointerStripUptoDataPoint: true,
                        // items는 선택된 포인트들의 배열
                        pointerLabelComponent: (items: Array<{ value: number; label?: string; date?: Date }>) => {
                            const v = items?.[0]?.value ?? 0;
                            return (
                                <View style={styles.tooltip}>
                                    <Text style={styles.tooltipText}>
                                        {fmtPct(Math.round(v * 10) / 10)}
                                    </Text>
                                </View>
                            );
                        },
                    }}

                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { backgroundColor: "#fff", borderRadius: 16, padding: 12, elevation: 3 },
    tabs: { flexDirection: "row", gap: 8, marginBottom: 8 },
    tab: {
        paddingVertical: 6, paddingHorizontal: 10,
        borderRadius: 999, backgroundColor: "#f3f4f6",
    },
    tabActive: { backgroundColor: "#111827" },
    tabText: { fontSize: 12, color: "#374151" },
    tabTextActive: { color: "#fff", fontWeight: "700" },
    empty: { height: 160, alignItems: "center", justifyContent: "center" },
    emptyText: { color: "#9ca3af" },
    tooltip: { backgroundColor: "#111827", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    tooltipText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});