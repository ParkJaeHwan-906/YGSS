import { Colors } from "@/src/theme/colors";
import { StyleSheet, Text, View } from "react-native";
export default function ItemCorp() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>운용사</Text>
            {/* <Text style={styles.value}>•{product.companyName}</Text> */}
            <Text style={styles.value}>• 삼성증권</Text>
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
    },
    value: {
        fontSize: 16,
        fontFamily: "BasicMedium",
        color: Colors.gray,
        marginLeft: 20
    },
});