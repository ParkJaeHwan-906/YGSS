import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IrpLoading() {
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => {
            router.push("/irp/recommend");
        }, 2000);
    }, []);
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Image source={require("@/assets/char/nuetralAlchi.png")} style={{ width: 200, height: 200 }} />
            <Text>Loading...</Text>
        </SafeAreaView>
    );
}