// app/(app)/(tabs)/irp/irp4.tsx

import { Image, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/src/theme/colors";
import { MotiView } from "moti";

export default function Irp4() {
    return (
        <SafeAreaView style={styles.container}>
            <MotiView
                from={{ translateY: 0 }}
                animate={{ translateY: -18 }}
                transition={{ type: "timing", duration: 600, loop: true, repeatReverse: true }}
                style={styles.alkiWrap}
                >
                <Image
                    source={require("@/assets/char/sadAlchi.png")}
                    style={{ width: 220, height: 220 }}
                />
            </MotiView>
            <Text style={styles.text}>아직 준비 중이에요 :)</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.back,
    },
    text: {
        fontFamily: "BasicMedium",
        fontSize: 16,
        marginTop: 20,
    },
    alkiWrap: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
 });