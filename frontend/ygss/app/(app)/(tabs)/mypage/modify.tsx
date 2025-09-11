// app/(app)/(tabs)/mypage/modify.tsx

import Button from "@/components/molecules/Button";
import MyInfo from "@/components/molecules/MyInfo";
import ProfitChart from "@/components/molecules/ProfitChart";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 가격 시계열(마지막 날짜가 최신)
const kospi = {
    id: "KOSPI",
    color: "#06b6d4",
    points: [
        { date: "2025-01-02", price: 2600 },
        { date: "2025-02-03", price: 2550 },
        // ...
    ],
};
const kosdaq = {
    id: "KOSDAQ",
    color: "#ef4444",
    points: [
        { date: "2025-01-02", price: 840 },
        // ...
    ],
};



export default function Mypage() {
    return (
        <SafeAreaView style={styles.container}>
            {/* 내 정보 */}
            <MyInfo />
            <Button label="적용하기" />

            <ProfitChart datasets={[kospi, kosdaq]} height={240} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
});