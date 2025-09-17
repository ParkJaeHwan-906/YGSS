import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IrpRecommend() {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>추천 상품</Text>
        </SafeAreaView>
    );
}