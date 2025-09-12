import { Colors } from "@/src/theme/colors";
import { StyleSheet, Text, View } from "react-native";

export default function ItemDue() {
    return (
        <View style={styles.container}>
            <View style={styles.dateWrap}>
                <Text style={styles.title}>잔존기간</Text>
                <Text style={styles.value}>D-21</Text>
            </View>
            <View style={styles.dateWrap}>
                <Text style={styles.title}>만기일</Text>
                <Text style={styles.value}>2025년 12월 31일</Text>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontFamily: "BasicBold",
        marginBottom: 10,
        color: Colors.black,
    },
    value: {
        fontSize: 16,
        fontFamily: "BasicMedium",
        color: Colors.gray,
        marginLeft: 20
    },
    dateWrap: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});         