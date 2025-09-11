// app/(app)/(tabs)/mypage/modify.tsx

import MyInfo from "@/components/molecules/MyInfo";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Mypage() {
    return (
        <SafeAreaView style={styles.container}>
            {/* 내 정보 */}
            <MyInfo />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
});