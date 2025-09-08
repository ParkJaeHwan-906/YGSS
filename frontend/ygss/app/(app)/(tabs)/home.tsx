// app/(app)/(tabs)/home.tsx
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
    const router = useRouter();
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text>홈 탭</Text>

        </View>
    );
}
