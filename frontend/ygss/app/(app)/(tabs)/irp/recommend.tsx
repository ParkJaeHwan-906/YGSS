import ItemCarousel from "@/components/organisms/ItemCarousel";
import { Colors } from "@/src/theme/colors";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IrpRecommend() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors?.back ?? "#F4F6FF", marginTop: 20 }}>
            <ScrollView >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitleLine1}>당신을 위한</Text>
                        <Text style={styles.headerTitleLine2}>알키의 상품 추천</Text>
                    </View>
                    <Image
                        source={require("@/assets/icon/search.png")} // 없으면 임시로 다른 아이콘 사용
                        style={styles.headerIcon}
                    />
                </View>

                <ItemCarousel />

                <View >
                    <Text>헬로우 이츠미</Text>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    headerTitleLine1: { fontSize: 24, fontFamily: "BasicBold", color: Colors?.black ?? "#111" },
    headerTitleLine2: { fontSize: 24, fontFamily: "BasicBold", color: Colors?.black ?? "#111" },
    headerIcon: { width: 44, height: 44, resizeMode: "contain", marginTop: 4 },
})  