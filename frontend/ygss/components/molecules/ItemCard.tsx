import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

type ItemCardProps = {
    id: number;
    title: string;
    rate: number;
    icon?: any;
};

export default function ItemCard({ id, title, rate, icon }: ItemCardProps) {
    const isPositive = rate >= 0;
    const router = useRouter();

    const handlePress = () => {
        router.push(`/(app)/(tabs)/dc/etf_fund/${id}`);
    };

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={[styles.cardRate, isPositive ? styles.up : styles.down]}>
                {isPositive ? `+${rate.toFixed(2)}%` : `${rate.toFixed(2)}%`}
            </Text>
            <Image
                source={icon || require("@/assets/icon/star.png")}
                style={styles.cardBadge}
            />
        </View>
    );
}

const CARD_W = 260;

export const cardConstants = {
    CARD_W,
    CARD_H: 220,
    SPACING: 18,
};

const styles = StyleSheet.create({
    card: {
        width: CARD_W,
        height: 220,
        borderRadius: 20,
        padding: 18,
        backgroundColor: "#FFF7A6",
        justifyContent: "flex-start",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    cardTitle: { fontSize: 20, fontFamily: "BasicBold", color: "#111", textAlign: "center" },
    cardRate: { marginTop: 8, fontSize: 18, fontFamily: "BasicBold", textAlign: "center" },
    up: { color: "#FF2C2C" },
    down: { color: "#2F6FFF" },
    cardBadge: {
        width: 70,
        height: 70,
        resizeMode: "contain",
        position: "absolute",
        left: "50%",
        transform: [{ translateX: -15 }],
        bottom: 18,
    },
});
