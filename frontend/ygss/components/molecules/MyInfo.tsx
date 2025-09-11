// components/molecules/MyInfo.tsx
import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MyInfo() {
    const user = useAppSelector((s) => s.auth.user);

    const name = user?.name ?? "—";
    const email = user?.email ?? "—";

    // workedAt: 0 또는 null -> 신입, 그 외 숫자 -> n년차 (원하면 "경력"으로 바꿔도 됨)
    const workedAt = user?.workedAt;
    const yearLabel =
        typeof workedAt === "number" && workedAt > 0 ? `${workedAt}년차` : "신입";

    // salary(만원 단위라고 가정)
    const salary = user?.salary;
    const salaryText =
        typeof salary === "number"
            ? `${salary.toLocaleString("ko-KR")} 만원`
            : "—";

    return (
        <View style={styles.card}>
            <Text style={styles.title}>기본 정보</Text>

            <View style={styles.row}>
                <Text style={styles.label}>이름</Text>
                <Text style={styles.value}>{name}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>이메일</Text>
                <Text style={styles.value}>{email}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>연차</Text>
                <Text style={styles.value}>{yearLabel}</Text>
            </View>

            <View style={styles.rowLast}>
                <Text style={styles.label}>나의 연봉</Text>
                <Text style={styles.value}>{salaryText}</Text>
            </View>
        </View>
    );
}

/* -------- styles (아래 분리) -------- */
const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        // 그림자
        shadowColor: Colors.primary,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontFamily: "BasicBold",
        color: Colors.black,
        marginBottom: 22,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    rowLast: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    label: {
        fontSize: 14,
        fontFamily: "BasicMedium",
        color: "#6B7280",
    },
    value: {
        fontSize: 14,
        fontFamily: "BasicLight",
        color: "#111827",
        fontWeight: "500",
    },
});
''