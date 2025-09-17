import { Image, StyleSheet, Text, View } from "react-native";

type ItemCardProps = {
    title: string;
    rate: number;
    icon?: any;
};

export default function ItemCard({ title, rate, icon }: ItemCardProps) {
    const isPositive = rate >= 0;

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
    cardTitle: { fontSize: 18, fontFamily: "BasicBold", color: "#111" },
    cardRate: { marginTop: 8, fontSize: 18, fontFamily: "BasicBold" },
    up: { color: "#FF2C2C" },
    down: { color: "#2F6FFF" },
    cardBadge: {
        width: 64,
        height: 64,
        resizeMode: "contain",
        position: "absolute",
        right: 18,
        bottom: 18,
    },
});
