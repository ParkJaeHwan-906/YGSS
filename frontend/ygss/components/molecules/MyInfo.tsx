import {
    StyleSheet,
    Text,
    View
} from "react-native";

export default function MyInfo() {
    return (
        <View style={styles.infoBox}>
            <Text>MyInfo</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    infoBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        margin: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3, // 안드로이드 그림자
    },
})