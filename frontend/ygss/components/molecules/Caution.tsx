import { Colors } from "@/src/theme/colors";
import { StyleSheet, Text, View } from "react-native";

export default function Caution() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>유의사항</Text>
            <Text style={styles.text}>•상품가입 전 상품(투자)설명서를 반드시 확인해주세요.</Text>
            <Text style={styles.text}>•이 계좌 내 투자성 상품은 예금자보호법에 따라 보호되지 않으며,</Text>
            <Text style={styles.text}> 운용 결과에 따라 원금의 일부 또는 전부 손실이 발생할 수 있습니다.</Text>
            <Text style={styles.text}>•투자자는 상품 설명을 듣고 충분히 이해한 후 투자를 결정해주세요.</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 14,
        fontFamily: "BasicBold",
        color: Colors.black,
        marginBottom: 8,
    },
    text: {
        fontSize: 10,
        fontFamily: "BasicLight",
        color: Colors.black,
    },
})