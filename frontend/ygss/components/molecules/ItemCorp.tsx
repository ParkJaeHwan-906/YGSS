import { Colors } from "@/src/theme/colors";
import { StyleSheet, Text, View } from "react-native";

export default function ItemCorp({ company }: { company: string }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>운용사</Text>
            <Text style={styles.value}>• {company}</Text>
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